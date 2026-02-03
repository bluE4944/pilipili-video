export const SYSTEM_ERROR_MESSAGE = '系统异常,请联络系统管理员。'

export const getErrorMessage = (error: unknown, fallback: string = SYSTEM_ERROR_MESSAGE): string => {
  if (!error) return fallback
  if (typeof error === 'string' && error.trim()) {
    const message = error.trim()
    if (/network error|timeout|failed to fetch/i.test(message)) return fallback
    return message
  }
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim()
    if (/network error|timeout|failed to fetch/i.test(message)) return fallback
    return message
  }

  const anyError = error as { message?: unknown; response?: { data?: unknown } }
  if (typeof anyError?.message === 'string' && anyError.message.trim()) {
    const message = anyError.message.trim()
    if (/network error|timeout|failed to fetch/i.test(message)) return fallback
    return message
  }

  const data = anyError?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return fallback
}
