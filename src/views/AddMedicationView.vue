<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicationStore } from '@/stores/medicationStore'
import { capturePhoto, recognizeMedication } from '@/services/ocrService'
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Clock, 
  Pill, 
  User, 
  FileText, 
  Check, 
  Plus, 
  Trash2,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-vue-next'

const router = useRouter()
const store = useMedicationStore()

// Estado do formulário
const form = ref({
  residentId: store.residents[0]?.id || '',
  name: '',
  dosage: '',
  schedules: ['08:00', '20:00'],
  instructions: '',
  photoUrl: ''
})

const isProcessingOcr = ref(false)
const ocrProgress = ref(0)
const ocrRawResult = ref(null)
const newScheduleTime = ref('14:00')
const fileInputRef = ref(null)
const successSaved = ref(false)

// Horários predefinidos para facilitar a rotina
const schedulePresets = [
  { label: '1x ao dia (08h)', times: ['08:00'] },
  { label: '12 em 12h (08h e 20h)', times: ['08:00', '20:00'] },
  { label: '8 em 8h (08h, 14h, 20h)', times: ['08:00', '14:00', '20:00'] },
  { label: 'À noite (21h)', times: ['21:00'] }
]

const applyPreset = (preset) => {
  form.value.schedules = [...preset.times]
}

const addSchedule = () => {
  if (newScheduleTime.value && !form.value.schedules.includes(newScheduleTime.value)) {
    form.value.schedules.push(newScheduleTime.value)
    form.value.schedules.sort()
  }
}

const removeSchedule = (time) => {
  form.value.schedules = form.value.schedules.filter(t => t !== time)
}

// Aciona câmera pelo Capacitor ou abre seletor
const handleCameraCapture = async () => {
  try {
    const photoBase64 = await capturePhoto()
    if (photoBase64) {
      form.value.photoUrl = photoBase64
      await processImageWithOcr(photoBase64)
    }
  } catch (error) {
    // Se falhar a câmera nativa (ex: rodando no navegador do PC), aciona o input file
    triggerFileInput()
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const dataUrl = e.target.result
    form.value.photoUrl = dataUrl
    await processImageWithOcr(dataUrl)
  }
  reader.readAsDataURL(file)
}

// Processa a imagem com Tesseract OCR e regex
const processImageWithOcr = async (imageSource) => {
  isProcessingOcr.value = true
  ocrProgress.value = 5
  ocrRawResult.value = null

  try {
    const result = await recognizeMedication(imageSource, (p) => {
      ocrProgress.value = p
    })

    ocrRawResult.value = result

    // Preencher automaticamente os inputs conforme especificação
    if (result.medicationName) {
      form.value.name = result.medicationName
    }
    if (result.dosage) {
      form.value.dosage = result.dosage
    }
  } catch (err) {
    console.error('Falha no processamento de OCR:', err)
  } finally {
    isProcessingOcr.value = false
    ocrProgress.value = 100
  }
}

// Amostra de simulação rápida para testes na demonstração
const simulateSampleOcr = (type) => {
  if (type === 'losartana') {
    form.value.photoUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
    form.value.name = 'Losartana Potássica'
    form.value.dosage = '50mg'
    form.value.instructions = 'Tomar pela manhã com um copo de água'
    form.value.schedules = ['08:00', '20:00']
    ocrRawResult.value = {
      medicationName: 'Losartana Potássica',
      dosage: '50mg',
      confidence: 94,
      rawText: 'LOSARTANA POTÁSSICA 50mg\nUSO ORAL - ADULTO\nCONTÉM 30 COMPRIMIDOS REVESTIDOS'
    }
  } else if (type === 'omeprazol') {
    form.value.photoUrl = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80'
    form.value.name = 'Omeprazol'
    form.value.dosage = '20mg'
    form.value.instructions = 'Tomar em jejum 30 minutos antes do café da manhã'
    form.value.schedules = ['07:30']
    ocrRawResult.value = {
      medicationName: 'Omeprazol',
      dosage: '20mg',
      confidence: 96,
      rawText: 'OMEPRAZOL 20mg\nCÁPSULAS COM MICROGRÂNULOS\nVENDA SOB PRESCRIÇÃO MÉDICA'
    }
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.dosage || !form.value.residentId) {
    alert('Por favor, preencha o nome do remédio, a dosagem e selecione o idoso.')
    return
  }

  if (form.value.schedules.length === 0) {
    alert('Adicione pelo menos um horário de administração.')
    return
  }

  await store.addMedication({
    residentId: form.value.residentId,
    name: form.value.name,
    dosage: form.value.dosage,
    schedules: form.value.schedules,
    instructions: form.value.instructions,
    photoUrl: form.value.photoUrl
  })

  successSaved.value = true
  setTimeout(() => {
    router.push('/')
  }, 1200)
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Cabeçalho Minimalista -->
    <div class="pt-1">
      <h2 class="text-base font-bold text-slate-900">Cadastrar Medicamento</h2>
      <p class="text-xs text-slate-500">Fotografe a embalagem para ler Nome e Dosagem via OCR</p>
    </div>

    <!-- Input file escondido para fallback web/mobile -->
    <input
      type="file"
      ref="fileInputRef"
      accept="image/*"
      capture="environment"
      @change="handleFileUpload"
      class="hidden"
    />

    <!-- Foto & OCR Minimalista -->
    <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <!-- Preview da Imagem se houver -->
      <div 
        v-if="form.photoUrl" 
        class="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-36 flex items-center justify-center group"
      >
        <img :src="form.photoUrl" alt="Embalagem capturada" class="w-full h-full object-cover" />
        
        <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            @click="handleCameraCapture"
            class="px-3 py-1.5 bg-white text-slate-900 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Camera class="w-3.5 h-3.5" />
            Trocar Foto
          </button>
        </div>

        <!-- Indicador de Processando OCR sobre a foto -->
        <div 
          v-if="isProcessingOcr" 
          class="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white px-4"
        >
          <Loader2 class="w-6 h-6 text-blue-400 animate-spin mb-1.5" />
          <span class="text-xs font-semibold">Lendo texto da embalagem... {{ ocrProgress }}%</span>
        </div>
      </div>

      <!-- Botão Tirar Foto e Galeria -->
      <div class="space-y-1.5">
        <button
          type="button"
          @click="handleCameraCapture"
          :disabled="isProcessingOcr"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
        >
          <Camera class="w-4 h-4 text-white" />
          <span>Tirar Foto da Embalagem</span>
        </button>

        <button
          type="button"
          @click="triggerFileInput"
          :disabled="isProcessingOcr"
          class="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>ou escolher da galeria</span>
        </button>
      </div>

      <!-- Amostras de Teste Rápido em 1 Linha -->
      <div class="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span class="flex-shrink-0">Exemplos:</span>
        <button
          type="button"
          @click="simulateSampleOcr('losartana')"
          class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors truncate"
        >
          Losartana 50mg
        </button>
        <button
          type="button"
          @click="simulateSampleOcr('omeprazol')"
          class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors truncate"
        >
          Omeprazol 20mg
        </button>
      </div>
    </div>

    <!-- Formulário Limpo de Dados -->
    <form @submit.prevent="handleSubmit" class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <!-- Residente -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Idoso Residente</label>
        <select
          v-model="form.residentId"
          required
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          <option v-for="res in store.residents" :key="res.id" :value="res.id">
            {{ res.name }}
          </option>
        </select>
      </div>

      <!-- Nome do Remédio e Dosagem em 2 colunas -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nome do Remédio</label>
          <input
            type="text"
            v-model="form.name"
            required
            placeholder="Ex: Losartana"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Dosagem</label>
          <input
            type="text"
            v-model="form.dosage"
            required
            placeholder="Ex: 50mg"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      <!-- Horários -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs font-semibold text-slate-700">Horários Diários</label>
          <div class="flex gap-1">
            <button
              v-for="preset in schedulePresets"
              :key="preset.label"
              type="button"
              @click="applyPreset(preset)"
              class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {{ preset.times.join('/') }}
            </button>
          </div>
        </div>

        <!-- Chips de horários atuais + adicionar -->
        <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
          <span
            v-for="time in form.schedules"
            :key="time"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200"
          >
            {{ time }}
            <button
              type="button"
              @click="removeSchedule(time)"
              class="text-amber-700 hover:text-red-600 ml-0.5"
            >
              ×
            </button>
          </span>

          <div class="inline-flex items-center gap-1">
            <input
              type="time"
              v-model="newScheduleTime"
              class="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <button
              type="button"
              @click="addSchedule"
              class="px-2 py-0.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- Instruções -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Instruções de Uso (Opcional)</label>
        <input
          type="text"
          v-model="form.instructions"
          placeholder="Ex: Tomar com água após almoço"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      <!-- Botão Salvar -->
      <button
        type="submit"
        :disabled="successSaved"
        class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:bg-emerald-600 mt-2"
      >
        <Check v-if="successSaved" class="w-4 h-4 text-white" />
        <Plus v-else class="w-4 h-4 text-white" />
        <span>{{ successSaved ? 'Salvo!' : 'Salvar Medicamento' }}</span>
      </button>
    </form>
  </div>
</template>
