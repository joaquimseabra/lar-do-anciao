/**
 * OCR Service - Lar do Ancião
 * Reconhecimento óptico de caracteres em embalagens de medicamentos usando Tesseract.js e Regex.
 */
import { createWorker } from 'tesseract.js'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

// Regex padrão solicitado na especificação técnica para extrair dosagens
// Suporta: 20mg, 40mg, 500mg, 0.5g, 10ml, 50mcg, 5000UI, etc.
export const DOSAGE_REGEX = /\b(\d+(?:[.,]\d+)?\s*(?:mg|g|ml|mcg|UI|ui|UI\/ml))\b/i

// Palavras comuns em caixas de remédios que não devem ser tratadas como o nome principal
const NOISE_WORDS = [
  'medicamento', 'genérico', 'lei', 'venda', 'sob', 'prescrição', 'médica',
  'uso', 'oral', 'adulto', 'pediátrico', 'comprimidos', 'cápsulas', 'gotas',
  'solução', 'xarope', 'conteúdo', 'contém', 'embalagem', 'fabricado', 'por',
  'laboratório', 'farmacêutica', 'validade', 'lote', 'ms', 'anvisa', 'conservar',
  'temperatura', 'ambiente', 'registro', 'dizeres', 'legais'
]

/**
 * Tira uma foto usando @capacitor/camera com fallback para input web
 */
export async function capturePhoto() {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      promptLabelHeader: 'Fotografar Remédio',
      promptLabelPhoto: 'Escolher da Galeria',
      promptLabelPicture: 'Tirar Foto com a Câmera'
    })
    return photo.dataUrl
  } catch (error) {
    console.warn('[Camera] Não foi possível abrir a câmera nativa do Capacitor. Usando fallback:', error)
    throw error
  }
}

/**
 * Analisa a imagem da caixa do remédio e extrai Nome e Dosagem
 * @param {string|File|Blob} imageSource - URL em base64 ou arquivo
 * @param {Function} onProgress - Callback de progresso do Tesseract (0 a 100)
 * @returns {Promise<{ rawText: string, medicationName: string, dosage: string, confidence: number }>}
 */
export async function recognizeMedication(imageSource, onProgress = null) {
  let worker = null
  try {
    worker = await createWorker('por', 1, {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100))
        }
      }
    })

    const { data } = await worker.recognize(imageSource)
    const rawText = data.text || ''
    const confidence = data.confidence || 0

    // Extrair dosagem via Regex
    const dosageMatch = rawText.match(DOSAGE_REGEX)
    const dosage = dosageMatch ? dosageMatch[0].trim() : ''

    // Extrair provável nome do medicamento
    const medicationName = extractProbableName(rawText)

    await worker.terminate()

    return {
      rawText,
      medicationName,
      dosage,
      confidence
    }
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {})
    }
    console.error('[OCR Error]', error)
    throw error
  }
}

/**
 * Analisa as linhas do texto e identifica a linha com maior probabilidade de ser o nome do remédio
 */
function extractProbableName(rawText) {
  if (!rawText) return ''

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length >= 3)

  for (const line of lines) {
    // Remove pontuações desnecessárias
    const cleanLine = line.replace(/[^\w\sÀ-ÿ]/gi, '').trim()
    const lower = cleanLine.toLowerCase()

    // Ignora linhas que são só números ou dosagens
    if (DOSAGE_REGEX.test(cleanLine) && cleanLine.length < 10) continue

    // Verifica se a linha consiste primariamente em palavras de ruído
    const words = lower.split(/\s+/)
    const noiseCount = words.filter(w => NOISE_WORDS.includes(w)).length

    if (words.length > 0 && noiseCount / words.length < 0.5) {
      // Se tiver de 1 a 4 palavras, é um candidato perfeito para nome de remédio
      if (words.length >= 1 && words.length <= 4) {
        // Formatar em Capitalize
        return cleanLine
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      }
    }
  }

  // Fallback: se tiver alguma linha com mais de 3 letras
  if (lines.length > 0) {
    return lines[0].slice(0, 30)
  }

  return ''
}
