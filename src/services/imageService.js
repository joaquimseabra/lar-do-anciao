/**
 * Image Service - Lar do Ancião
 * Compressão de fotos no próprio aparelho (canvas), antes de salvar localmente ou enviar à nuvem.
 * Meta: ~150KB por foto para economizar armazenamento e dados móveis.
 */

const DEFAULT_OPTIONS = {
  maxDimension: 1024,      // maior lado da imagem, em pixels
  targetBytes: 150 * 1024, // tamanho máximo desejado
  initialQuality: 0.85,
  minQuality: 0.5
}

// Tamanho real (em bytes) do conteúdo de um data URL base64
export const getDataUrlSize = (dataUrl) => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor(base64.length * 3 / 4) - padding
}

export const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const loadImage = (source) => new Promise((resolve, reject) => {
  const isBlob = source instanceof Blob
  const url = isBlob ? URL.createObjectURL(source) : source
  const img = new Image()
  img.onload = () => {
    if (isBlob) URL.revokeObjectURL(url)
    resolve(img)
  }
  img.onerror = () => {
    if (isBlob) URL.revokeObjectURL(url)
    reject(new Error('Não foi possível carregar a imagem para compressão.'))
  }
  img.src = url
})

const renderJpeg = (img, maxDimension, quality) => {
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)

  const ctx = canvas.getContext('2d')
  // Fundo branco: PNGs com transparência ficariam pretos em JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Redimensiona e comprime uma imagem para JPEG até caber em `targetBytes`.
 * Primeiro reduz a qualidade; se não bastar, reduz também a resolução.
 * @param {string|File|Blob} source - data URL ou arquivo de imagem
 * @returns {Promise<{ dataUrl: string, bytes: number, originalBytes: number|null }>}
 */
export async function compressImage(source, options = {}) {
  const { maxDimension, targetBytes, initialQuality, minQuality } = { ...DEFAULT_OPTIONS, ...options }
  const originalBytes = source instanceof Blob
    ? source.size
    : (typeof source === 'string' && source.startsWith('data:') ? getDataUrlSize(source) : null)

  const img = await loadImage(source)

  let dimension = maxDimension
  let quality = initialQuality
  let dataUrl = renderJpeg(img, dimension, quality)

  while (getDataUrlSize(dataUrl) > targetBytes && dimension > 320) {
    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1)
    } else {
      dimension = Math.round(dimension * 0.8)
    }
    dataUrl = renderJpeg(img, dimension, quality)
  }

  return { dataUrl, bytes: getDataUrlSize(dataUrl), originalBytes }
}
