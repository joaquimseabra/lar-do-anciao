import { DOSAGE_REGEX } from './src/services/ocrService.js'

let totalTests = 0
let passedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    console.log(`✅ PASS: ${message}`)
    passedTests++
  } else {
    console.error(`❌ FAIL: ${message}`)
  }
}

console.log('\n--- 1. TESTES DO REGEX DE DOSAGEM ---')
const testCases = [
  { text: 'LOSARTANA POTÁSSICA 50mg', expected: '50mg' },
  { text: 'OMEPRAZOL 20mg USO ORAL', expected: '20mg' },
  { text: 'METFORMINA 850mg COMPRIMIDOS', expected: '850mg' },
  { text: 'CARBONATO DE CÁLCIO 600mg + VIT D', expected: '600mg' },
  { text: 'ENALAPRIL 10mg', expected: '10mg' },
  { text: 'POMADA DERMATOLÓGICA 0.5g', expected: '0.5g' },
  { text: 'XAROPE INFANTIL 10ml', expected: '10ml' },
  { text: 'VITAMINA D3 5000UI', expected: '5000UI' },
  { text: 'LEVOTIROXINA 50mcg', expected: '50mcg' }
]

testCases.forEach(tc => {
  const match = tc.text.match(DOSAGE_REGEX)
  assert(match && match[0].trim().toLowerCase() === tc.expected.toLowerCase(), `Extrair "${tc.expected}" de "${tc.text}" -> Obteve: ${match ? match[0] : 'null'}`)
})

console.log('\n--- 2. TESTES DE FILTRAGEM DE NOMES ---')
const sampleBoxText = `
MEDICAMENTO GENÉRICO
LEI Nº 9.787, DE 1999
Losartana Potássica
50mg
USO ORAL - ADULTO
CONTÉM 30 COMPRIMIDOS
`

// Test extraction manually using same logic
const NOISE_WORDS = [
  'medicamento', 'genérico', 'lei', 'venda', 'sob', 'prescrição', 'médica',
  'uso', 'oral', 'adulto', 'pediátrico', 'comprimidos', 'cápsulas', 'gotas',
  'solução', 'xarope', 'conteúdo', 'contém', 'embalagem', 'fabricado', 'por',
  'laboratório', 'farmacêutica', 'validade', 'lote', 'ms', 'anvisa', 'conservar',
  'temperatura', 'ambiente', 'registro', 'dizeres', 'legais'
]

function extractName(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length >= 3)
  for (const line of lines) {
    const cleanLine = line.replace(/[^\w\sÀ-ÿ]/gi, '').trim()
    const lower = cleanLine.toLowerCase()
    if (DOSAGE_REGEX.test(cleanLine) && cleanLine.length < 10) continue
    const words = lower.split(/\s+/)
    const noiseCount = words.filter(w => NOISE_WORDS.includes(w)).length
    if (words.length > 0 && noiseCount / words.length < 0.5) {
      if (words.length >= 1 && words.length <= 4) {
        return cleanLine.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      }
    }
  }
  return lines[0] || ''
}

const extractedName = extractName(sampleBoxText)
assert(extractedName === 'Losartana Potássica', `Nome do remédio extraído corretamente: "${extractedName}"`)

console.log('\n--- 3. TESTE DOS HELPERS DE DATA ---')
import { getTodayDateStr, getNowLocalDateTimeStr, isTodayAdministration, useMedicationStore } from './src/stores/medicationStore.js'
import { createPinia, setActivePinia } from 'pinia'

const today = getTodayDateStr()
const nowDt = getNowLocalDateTimeStr()
assert(typeof today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(today), `getTodayDateStr retorna formato YYYY-MM-DD (${today})`)
assert(typeof nowDt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(nowDt), `getNowLocalDateTimeStr retorna formato ISO local (${nowDt})`)
assert(isTodayAdministration(nowDt) === true, `isTodayAdministration reconhece data atual como verdadeira`)
assert(isTodayAdministration('2020-01-01T08:00:00') === false, `isTodayAdministration rejeita data antiga de 2020`)

console.log('\n--- 4. TESTES DO ESTADO REATIVO (PINIA STORE) ---')
// Configurar Pinia no ambiente Node
setActivePinia(createPinia())

// Mock do localStorage para ambiente Node se não estiver presente
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null },
    setItem(key, val) { this._data[key] = String(val) },
    removeItem(key) { delete this._data[key] },
    clear() { this._data = {} }
  }
}

const store = useMedicationStore()

assert(store.residents.length === 5, `Store inicializa com 5 residentes cadastrados`)
assert(store.medications.length === 6, `Store inicializa com 6 medicamentos prescritos`)

const initialDelayedCount = store.delayedMedications.length
const initialUpcomingCount = store.upcomingMedications.length
const initialHistoryCount = store.todayHistory.length

console.log(`Estado inicial: Atrasados=${initialDelayedCount}, Próximos=${initialUpcomingCount}, Histórico Hoje=${initialHistoryCount}`)
assert(initialDelayedCount > 0, `Existe ao menos 1 medicamento com horário atrasado para o alerta visual`)
assert(initialUpcomingCount > 0, `Existe ao menos 1 próximo medicamento agendado`)

// Testar confirmação de medicamento (1 toque)
const targetSlot = store.delayedMedications[0]
const targetResidentName = targetSlot.residentName
const targetMedName = targetSlot.medicationName
console.log(`Confirmando remédio: ${targetMedName} para ${targetResidentName} (${targetSlot.scheduledTime})...`)

await store.confirmMedication(targetSlot)

assert(store.delayedMedications.length === initialDelayedCount - 1, `Remédio confirmado foi removido da lista de pendências atrasadas`)
assert(store.todayHistory.length === initialHistoryCount + 1, `Remédio confirmado foi adicionado ao Histórico auditável`)
assert(store.todayHistory[0].medicationName === targetMedName, `Histórico registra o nome correto do remédio (${targetMedName})`)
assert(store.todayHistory[0].caregiverName === store.currentCaregiver.name, `Histórico registra o nome da cuidadora logada (${store.currentCaregiver.name})`)

// Testar cadastro de novo idoso
const newRes = await store.addResident({
  name: 'Sebastião Valério'
})
assert(store.residents.some(r => r.name === 'Sebastião Valério'), `Novo idoso residente cadastrado com sucesso`)

// Testar cadastro de novo medicamento com OCR simulado
const newMed = await store.addMedication({
  residentId: newRes.id,
  name: 'Captopril',
  dosage: '25mg',
  schedules: ['09:00', '21:00'],
  instructions: 'Tomar 1 hora antes das refeições'
})
assert(store.medications.some(m => m.name === 'Captopril' && m.dosage === '25mg'), `Novo medicamento cadastrado com sucesso`)

// Testar troca de cuidadora
store.setCurrentCaregiver({ id: 'cg-2', name: 'Joana Santos', role: 'Cuidadora da Tarde' })
assert(store.currentCaregiver.name === 'Joana Santos', `Perfil ativo alterado para Joana Santos`)

console.log(`\n========================================`)
console.log(`RESULTADO: ${passedTests} de ${totalTests} testes passaram com sucesso!`)
console.log(`========================================\n`)

if (passedTests === totalTests) {
  process.exit(0)
} else {
  process.exit(1)
}
