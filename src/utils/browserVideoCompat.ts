import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_VERSION = '0.12.6'
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`
const BROWSER_COMPAT_MAX_SIZE = 600 * 1024 * 1024

let ffmpeg: FFmpeg | null = null
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

const getBlobUrls = async () => {
  const [coreURL, wasmURL, workerURL] = await Promise.all([
    toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
    toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript')
  ])
  return { coreURL, wasmURL, workerURL }
}

const getFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg?.loaded) {
    return ffmpeg
  }
  if (ffmpegLoadPromise) {
    return ffmpegLoadPromise
  }

  ffmpegLoadPromise = (async () => {
    const instance = ffmpeg || new FFmpeg()
    const urls = await getBlobUrls()
    await instance.load(urls)
    ffmpeg = instance
    return instance
  })().finally(() => {
    ffmpegLoadPromise = null
  })

  return ffmpegLoadPromise
}

const safeDeleteFile = async (instance: FFmpeg, path: string) => {
  try {
    await instance.deleteFile(path)
  } catch (error) {
    console.warn('Failed to delete FFmpeg temp file:', path, error)
  }
}

export const getBrowserCompatMaxSizeMb = () => Math.round(BROWSER_COMPAT_MAX_SIZE / 1024 / 1024)

export const getBrowserCompatFallbackReason = (file?: File | null): string => {
  if (!file) {
    return 'missing_local_file'
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (ext !== 'mkv') {
    return 'unsupported_extension'
  }
  if (file.size > BROWSER_COMPAT_MAX_SIZE) {
    return 'file_too_large'
  }
  return ''
}

export const isBrowserCompatFallbackCandidate = (file?: File | null) => {
  return !getBrowserCompatFallbackReason(file)
}

export const createBrowserCompatibleMp4Url = async (
  file: File,
  options?: {
    onProgress?: (progress: number, status: string) => void
  }
): Promise<string> => {
  const reason = getBrowserCompatFallbackReason(file)
  if (reason) {
    throw new Error(reason)
  }

  options?.onProgress?.(0.05, 'loading_engine')
  const instance = await getFFmpeg()

  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const inputName = `input-${token}.mkv`
  const outputName = `output-${token}.mp4`

  const progressHandler = ({ progress }: { progress: number }) => {
    const normalized = Math.max(0.1, Math.min(0.98, 0.1 + progress * 0.85))
    options?.onProgress?.(normalized, 'transcoding')
  }

  instance.on('progress', progressHandler)
  try {
    options?.onProgress?.(0.1, 'writing_input')
    await instance.writeFile(inputName, await fetchFile(file))
    options?.onProgress?.(0.15, 'transcoding')
    const exitCode = await instance.exec([
      '-i', inputName,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-sn',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ac', '2',
      '-movflags', '+faststart',
      outputName
    ])
    if (exitCode !== 0) {
      throw new Error('ffmpeg_exec_failed')
    }
    const data = await instance.readFile(outputName)
    if (!(data instanceof Uint8Array)) {
      throw new Error('ffmpeg_output_invalid')
    }
    const blob = new Blob([data], { type: 'video/mp4' })
    options?.onProgress?.(1, 'ready')
    return URL.createObjectURL(blob)
  } finally {
    instance.off('progress', progressHandler)
    await safeDeleteFile(instance, inputName)
    await safeDeleteFile(instance, outputName)
  }
}
