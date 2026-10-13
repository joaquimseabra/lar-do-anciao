<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicationStore } from '@/stores/medicationStore'
import { capturePhoto, recognizeMedication } from '@/services/ocrService'
import { compressImage, formatBytes } from '@/services/imageService'
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
  Edit2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Search,
  X,
  ListFilter
} from 'lucide-vue-next'

const router = useRouter()
const store = useMedicationStore()

// Aba ativa: formulário ('form') ou lista de prescrições ativas ('list')
const activeViewTab = ref('form')
const editingMedId = ref(null)
const listSearchQuery = ref('')

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
const photoSizeInfo = ref('')

// Horários predefinidos para facilitar a rotina
const schedulePresets = [
  { label: '1x ao dia (08h)', times: ['08:00'] },
  { label: '12 em 12h (08h e 20h)', times: ['08:00', '20:00'] },
  { label: '8 em 8h (08h, 14h, 20h)', times: ['08:00', '14:00', '20:00'] },
  { label: 'À noite (22h)', times: ['22:00'] }
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
      await handleNewPhoto(photoBase64)
    }
  } catch (error) {
    triggerFileInput()
  }
}

// Salva a versão comprimida da foto; o OCR lê a original, em resolução total
const handleNewPhoto = async (source) => {
  try {
    const { dataUrl, bytes, originalBytes } = await compressImage(source)
    form.value.photoUrl = dataUrl
    photoSizeInfo.value = originalBytes
      ? `Foto otimizada: ${formatBytes(originalBytes)} → ${formatBytes(bytes)}`
      : `Foto otimizada: ${formatBytes(bytes)}`
  } catch (err) {
    console.error('Falha ao comprimir a foto:', err)
    alert('Não foi possível processar esta imagem. Tente outra foto.')
    return
  }
  await processImageWithOcr(source)
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  await handleNewPhoto(file)
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

// Lista enriquecida de todas as medicações cadastradas
const allMedicationsEnriched = computed(() => {
  return store.medications.map(m => {
    const res = store.residents.find(r => r.id === m.residentId)
    return {
      ...m,
      residentName: res ? res.name : 'Residente Desconhecido',
      residentRoom: res ? res.room : '',
      residentPhoto: res ? res.photoUrl : ''
    }
  })
})

const filteredMedicationsList = computed(() => {
  if (!listSearchQuery.value) return allMedicationsEnriched.value
  const q = listSearchQuery.value.toLowerCase()
  return allMedicationsEnriched.value.filter(m => 
    m.name.toLowerCase().includes(q) ||
    m.dosage.toLowerCase().includes(q) ||
    m.residentName.toLowerCase().includes(q)
  )
})

const startEditMedication = (med) => {
  editingMedId.value = med.id
  form.value = {
    residentId: med.residentId,
    name: med.name,
    dosage: med.dosage,
    schedules: [...(med.schedules || ['08:00'])],
    instructions: med.instructions || '',
    photoUrl: med.photoUrl || ''
  }
  activeViewTab.value = 'form'
}

const cancelEdit = () => {
  editingMedId.value = null
  form.value = {
    residentId: store.residents[0]?.id || '',
    name: '',
    dosage: '',
    schedules: ['08:00', '20:00'],
    instructions: '',
    photoUrl: ''
  }
}

const handleDeleteMed = async (med) => {
  if (confirm(`Deseja suspender a administração de ${med.name} (${med.dosage}) para ${med.residentName}?`)) {
    await store.deleteMedication(med.id)
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

  if (editingMedId.value) {
    await store.updateMedication(editingMedId.value, {
      residentId: form.value.residentId,
      name: form.value.name,
      dosage: form.value.dosage,
      schedules: form.value.schedules,
      instructions: form.value.instructions,
      photoUrl: form.value.photoUrl
    })
    editingMedId.value = null
    activeViewTab.value = 'list'
  } else {
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
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h2 class="text-base font-bold text-slate-900">
          {{ editingMedId ? 'Editar Medicamento' : 'Medicamentos' }}
        </h2>
        <p class="text-xs text-slate-500">
          {{ editingMedId ? 'Alterando posologia prescrita' : 'Prescrição e controle de remédios' }}
        </p>
      </div>

      <!-- Alternador de Abas: Formulário vs Lista de Prescrições -->
      <div class="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
        <button
          type="button"
          @click="activeViewTab = 'form'"
          class="px-2.5 py-1 rounded-lg transition-all"
          :class="activeViewTab === 'form' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
        >
          {{ editingMedId ? 'Editar' : '+ Novo' }}
        </button>
        <button
          type="button"
          @click="activeViewTab = 'list'"
          class="px-2.5 py-1 rounded-lg transition-all"
          :class="activeViewTab === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
        >
          Prescrições ({{ store.medications.length }})
        </button>
      </div>
    </div>

    <!-- MODO 1: LISTA DE PRESCRIÇÕES ATIVAS -->
    <div v-if="activeViewTab === 'list'" class="space-y-3">
      <!-- Barra de busca da lista -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          v-model="listSearchQuery"
          placeholder="Buscar por remédio, dosagem ou idoso..."
          class="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
        />
        <button
          v-if="listSearchQuery"
          @click="listSearchQuery = ''"
          class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Itens de Prescrição -->
      <div v-if="filteredMedicationsList.length > 0" class="space-y-2.5">
        <div
          v-for="med in filteredMedicationsList"
          :key="med.id"
          class="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <img
                :src="med.residentPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80'"
                :alt="med.residentName"
                class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div class="min-w-0">
                <h4 class="font-bold text-slate-900 text-sm truncate">
                  {{ med.name }} <span class="text-blue-600 font-semibold">({{ med.dosage }})</span>
                </h4>
                <p class="text-xs text-slate-600 font-medium truncate">
                  Para: <span class="font-bold text-slate-800">{{ med.residentName }}</span>
                  <span v-if="med.residentRoom" class="text-slate-400"> • {{ med.residentRoom }}</span>
                </p>
              </div>
            </div>

            <!-- Ações: Editar e Excluir -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                @click="startEditMedication(med)"
                class="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar horários e dosagem"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="handleDeleteMed(med)"
                class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Suspender medicamento"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Horários e Instruções -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div class="flex items-center gap-1">
              <Clock class="w-3.5 h-3.5 text-amber-500" />
              <span class="font-semibold text-slate-700">Horários:</span>
              <span class="font-bold text-slate-900">{{ (med.schedules || []).join(', ') }}</span>
            </div>
            <span v-if="med.instructions" class="text-slate-400 truncate max-w-[150px] italic">
              {{ med.instructions }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
        Nenhum medicamento encontrado para "{{ listSearchQuery }}".
      </div>
    </div>

    <!-- MODO 2: FORMULÁRIO DE CADASTRO / EDIÇÃO COM OCR -->
    <div v-else class="space-y-3.5">
      <!-- Aviso de Edição -->
      <div 
        v-if="editingMedId" 
        class="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between text-xs text-blue-900"
      >
        <span>Você está editando a prescrição de <strong>{{ form.name }}</strong>.</span>
        <button
          type="button"
          @click="cancelEdit"
          class="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
        >
          Cancelar
        </button>
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

        <p v-if="photoSizeInfo" class="text-[11px] text-slate-500 font-medium text-center">
          {{ photoSizeInfo }}
        </p>

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
              {{ res.name }} {{ res.room ? `(${res.room})` : '' }}
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

        <!-- Botão Salvar / Atualizar -->
        <button
          type="submit"
          :disabled="successSaved"
          class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:bg-emerald-600 mt-2"
        >
          <Check v-if="successSaved" class="w-4 h-4 text-white" />
          <Edit2 v-else-if="editingMedId" class="w-4 h-4 text-white" />
          <Plus v-else class="w-4 h-4 text-white" />
          <span>{{ successSaved ? 'Salvo!' : (editingMedId ? 'Atualizar Prescrição' : 'Salvar Medicamento') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
