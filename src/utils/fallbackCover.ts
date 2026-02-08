const fallbackCoverImages = [
  '1672655299949.png',
  '1678187827665.png',
  '1678187847254.jpg',
  '1678187886484.png',
  '1678187888512.png',
  '1678187890233.png',
  '1678187892505.jpg',
  '1678187912892.png',
  '1678187920070.jpg',
  '1678187923185.png',
  '1678187926312.png',
  '1678187975412.jpg',
  '1678187977051.png'
]

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const getFallbackCover = (id?: string | number) => {
  if (fallbackCoverImages.length === 0) return ''
  const key = String(id ?? '')
  const index = key ? hashString(key) % fallbackCoverImages.length : 0
  return `/images-ppt/${fallbackCoverImages[index]}`
}
