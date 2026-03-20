import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_VERSION = '0.12.6'
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/umd`
const BROWSER_COMPAT_MAX_SIZE = 600 * 1024 * 1024

export type BrowserCompatSource =
  | File
  | {
      url: string
      fileName?: string
      size?: number | null
    }

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

const resolveSourceName = (source?: BrowserCompatSource | null) => {
  if (!source) return ''
  if (source instanceof File) {
    return source.name
  }
  return source.fileName || source.url || ''
}

const resolveSourceSize = (source?: BrowserCompatSource | null) => {
  if (!source) return null
  if (source instanceof File) {
    return source.size
  }
  return typeof source.size === 'number' ? source.size : null
}

export const getBrowserCompatFallbackReason = (source?: BrowserCompatSource | null): string => {
  if (!source) {
    return 'missing_source'
  }
  const ext = resolveSourceName(source).split('.').pop()?.toLowerCase() || ''
  if (ext !== 'mkv') {
    return 'unsupported_extension'
  }
  const size = resolveSourceSize(source)
  if (typeof size === 'number' && size > BROWSER_COMPAT_MAX_SIZE) {
    return 'file_too_large'
  }
  return ''
}

export const isBrowserCompatFallbackCandidate = (source?: BrowserCompatSource | null) => {
  return !getBrowserCompatFallbackReason(source)
}

export const createBrowserCompatibleMp4Url = async (
  source: BrowserCompatSource,
  options?: {
    onProgress?: (progress: number, status: string) => void
  }
): Promise<string> => {
  const reason = getBrowserCompatFallbackReason(source)
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
    options?.onProgress?.(0.1, source instanceof File ? 'writing_input' : 'fetching_input')
    const inputData = source instanceof File ? await fetchFile(source) : await fetchFile(source.url)
    options?.onProgress?.(0.15, 'writing_input')
    await instance.writeFile(inputName, inputData)
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
