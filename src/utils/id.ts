export const isNumericId = (value?: string | number | null): boolean => {
  if (value === null || value === undefined) return false
  const text = String(value).trim()
  return text.length > 0 && /^[0-9]+$/.test(text)
}
