<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicationStore } from '@/stores/medicationStore'
import { useAuthStore } from '@/stores/authStore'
import { capturePhoto } from '@/services/ocrService'
import { compressImage } from '@/services/imageService'
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  Check,
  Camera,
  Upload,
  HeartPulse,
  DoorClosed,
  AlertTriangle,
  Pill,
  Clock,
  Trash2,
  Edit2,
  Eye,
  Plus,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-vue-next'

const router = useRouter()
const store = useMedicationStore()
const auth = useAuthStore()

const searchQuery = ref('')
const isModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedResident = ref(null)
const isEditing = ref(false)
const fileInputRef = ref(null)

const residentForm = ref({
  id: '',
  name: '',
  room: '',
  age: 80,
  healthConditionsText: '',
  notes: '',
  photoUrl: ''
})

const defaultAvatars = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
]

const quickConditions = ['Hipertensão', 'Diabetes Tipo 2', 'Cardiopatia', 'Alergia a Dipirona', 'Parkinson', 'Alzheimer', 'Osteoporose']

const filteredResidents = computed(() => {
  if (!searchQuery.value) return store.residents
  const q = searchQuery.value.toLowerCase()
  return store.residents.filter(r => 
    r.name.toLowerCase().includes(q) || 
    (r.room && r.room.toLowerCase().includes(q)) ||
    (r.healthConditions && r.healthConditions.some(c => c.toLowerCase().includes(q)))
  )
})

const getResidentMedications = (residentId) => {
  return store.medications.filter(m => m.residentId === residentId)
}

const openNewResidentModal = () => {
  isEditing.value = false
  residentForm.value = {
    id: '',
    name: '',
    room: '',
    age: 78,
    healthConditionsText: '',
    notes: '',
    photoUrl: defaultAvatars[0]
  }
  isModalOpen.value = true
}

const openEditResidentModal = (resident) => {
  isEditing.value = true
  residentForm.value = {
    id: resident.id,
    name: resident.name,
    room: resident.room || '',
    age: resident.age || 75,
    healthConditionsText: (resident.healthConditions || []).join(', '),
    notes: resident.notes || '',
    photoUrl: resident.photoUrl || defaultAvatars[0]
  }
  isDetailModalOpen.value = false
  isModalOpen.value = true
}

const openResidentDetails = (resident) => {
  selectedResident.value = resident
  isDetailModalOpen.value = true
}

const handlePhotoCapture = async () => {
  try {
    const photoBase64 = await capturePhoto()
    if (photoBase64) {
      const { dataUrl } = await compressImage(photoBase64)
      residentForm.value.photoUrl = dataUrl
    }
  } catch (error) {
    if (fileInputRef.value) fileInputRef.value.click()
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  try {
    const { dataUrl } = await compressImage(file)
    residentForm.value.photoUrl = dataUrl
  } catch (err) {
    alert('Erro ao carregar a imagem.')
  }
}

const toggleCondition = (cond) => {
  const current = residentForm.value.healthConditionsText
    ? residentForm.value.healthConditionsText.split(',').map(s => s.trim()).filter(Boolean)
    : []
  
  if (current.includes(cond)) {
    residentForm.value.healthConditionsText = current.filter(c => c !== cond).join(', ')
  } else {
    current.push(cond)
    residentForm.value.healthConditionsText = current.join(', ')
  }
}

const handleSaveResident = async () => {
  if (!residentForm.value.name.trim()) {
    alert('Por favor, informe o nome do residente.')
    return
  }

  const conditions = residentForm.value.healthConditionsText
    ? residentForm.value.healthConditionsText.split(',').map(s => s.trim()).filter(Boolean)
    : ['Acompanhamento de rotina']

  const payload = {
    name: residentForm.value.name.trim(),
    room: residentForm.value.room.trim() || 'Quarto Geral',
    age: Number(residentForm.value.age) || 75,
    healthConditions: conditions,
    notes: residentForm.value.notes.trim(),
    photoUrl: residentForm.value.photoUrl || defaultAvatars[0]
  }

  if (isEditing.value && residentForm.value.id) {
    await store.updateResident(residentForm.value.id, payload)
  } else {
    await store.addResident(payload)
  }

  isModalOpen.value = false
}

const handleDeleteResident = async (resident) => {
  if (confirm(`Atenção: Deseja realmente excluir ${resident.name}? Todos os medicamentos vinculados também serão removidos.`)) {
    await store.deleteResident(resident.id)
    isDetailModalOpen.value = false
  }
}

const handleDeleteMedication = async (med) => {
  if (confirm(`Deseja suspender a administração de ${med.name} (${med.dosage}) para este residente?`)) {
    await store.deleteMedication(med.id)
  }
}

const prescribeForResident = (resident) => {
  isDetailModalOpen.value = false
  router.push('/add-medication')
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Input escondido para foto -->
    <input
      type="file"
      ref="fileInputRef"
      accept="image/*"
      @change="handleFileUpload"
      class="hidden"
    />

    <!-- Cabeçalho -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h2 class="text-base font-bold text-slate-900">Residentes</h2>
        <p class="text-xs text-slate-500">{{ store.residents.length }} idosos sob cuidado</p>
      </div>

      <!-- Botão Novo Idoso (Apenas para Admin no RBAC) -->
      <button
        v-if="auth.isAdmin"
        @click="openNewResidentModal"
        class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
      >
        <UserPlus class="w-3.5 h-3.5" />
        <span>+ Novo Idoso</span>
      </button>

      <span v-else class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
        Modo Consulta
      </span>
    </div>

    <!-- Barra de Busca Minimalista -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search class="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar por nome, quarto ou condição..."
        class="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Lista de Idosos em Cards Ricos e Clicáveis -->
    <div class="space-y-2.5">
      <div
        v-for="resident in filteredResidents"
        :key="resident.id"
        @click="openResidentDetails(resident)"
        class="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div class="flex items-start gap-3">
          <!-- Foto do Residente -->
          <img
            :src="resident.photoUrl"
            :alt="resident.name"
            class="w-13 h-13 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
          />

          <!-- Informações Principais -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h3 class="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                {{ resident.name }}
              </h3>
              <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
            </div>

            <!-- Quarto e Idade -->
            <p class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span class="font-medium text-slate-700">{{ resident.room || 'Quarto Geral' }}</span>
              <span v-if="resident.age" class="text-slate-400">• {{ resident.age }} anos</span>
            </p>

            <!-- Tags de Saúde / Diagnósticos -->
            <div class="mt-1.5 flex flex-wrap gap-1">
              <span
                v-for="cond in (resident.healthConditions || []).slice(0, 3)"
                :key="cond"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                :class="cond.toLowerCase().includes('alergia') 
                  ? 'bg-red-50 text-red-700 border border-red-200 font-bold' 
                  : 'bg-slate-100 text-slate-600'"
              >
                {{ cond }}
              </span>
              <span 
                v-if="(resident.healthConditions || []).length > 3" 
                class="text-[10px] text-slate-400 font-semibold self-center"
              >
                +{{ resident.healthConditions.length - 3 }}
              </span>
            </div>

            <!-- Resumo de Remédios -->
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span class="flex items-center gap-1">
                <Pill class="w-3.5 h-3.5 text-blue-500" />
                <span class="font-semibold text-slate-700">{{ getResidentMedications(resident.id).length }}</span> medicamento{{ getResidentMedications(resident.id).length === 1 ? '' : 's' }}
              </span>
              <span class="text-[10px] text-blue-600 font-medium">Ver Prontuário →</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE DETALHES / PRONTUÁRIO COMPLETO -->
    <div
      v-if="isDetailModalOpen && selectedResident"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 my-auto space-y-4 max-h-[90vh] overflow-y-auto">
        <!-- Topo com Foto e Ações -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <img
              :src="selectedResident.photoUrl"
              :alt="selectedResident.name"
              class="w-14 h-14 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h3 class="font-bold text-slate-900 text-base leading-tight">{{ selectedResident.name }}</h3>
              <p class="text-xs text-slate-500">{{ selectedResident.room }} • {{ selectedResident.age }} anos</p>
            </div>
          </div>

          <button @click="isDetailModalOpen = false" class="text-slate-400 hover:text-slate-600 p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Diagnósticos & Cuidados -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <HeartPulse class="w-3.5 h-3.5 text-red-500" />
            Condições & Alergias
          </h4>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="cond in (selectedResident.healthConditions || [])"
              :key="cond"
              class="px-2 py-0.5 rounded-lg text-xs font-semibold"
              :class="cond.toLowerCase().includes('alergia') ? 'bg-red-100 text-red-800' : 'bg-white border border-slate-200 text-slate-700'"
            >
              {{ cond }}
            </span>
          </div>
          <p v-if="selectedResident.notes" class="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
            <strong>Obs:</strong> {{ selectedResident.notes }}
          </p>
        </div>

        <!-- Lista de Medicamentos Prescritos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Pill class="w-3.5 h-3.5 text-blue-600" />
              Medicamentos Prescritos ({{ getResidentMedications(selectedResident.id).length }})
            </h4>

            <button
              v-if="auth.isAdmin"
              @click="prescribeForResident(selectedResident)"
              class="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
            >
              <Plus class="w-3 h-3" />
              Prescrever
            </button>
          </div>

          <div v-if="getResidentMedications(selectedResident.id).length > 0" class="space-y-2">
            <div
              v-for="med in getResidentMedications(selectedResident.id)"
              :key="med.id"
              class="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate">
                  {{ med.name }} <span class="text-blue-600">({{ med.dosage }})</span>
                </p>
                <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock class="w-3 h-3 text-amber-500" />
                  Horários: {{ (med.schedules || []).join(', ') }}
                </p>
                <p v-if="med.instructions" class="text-[10px] text-slate-400 italic mt-0.5 truncate">
                  {{ med.instructions }}
                </p>
              </div>

              <!-- Excluir/Suspender Medicação (Apenas Admin) -->
              <button
                v-if="auth.isAdmin"
                type="button"
                @click="handleDeleteMedication(med)"
                class="p-1.5 text-slate-300 hover:text-red-600 transition-colors"
                title="Suspender este remédio"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p v-else class="text-xs text-slate-400 italic text-center py-2">
            Nenhum medicamento ativo prescrito para este residente.
          </p>
        </div>

        <!-- Ações do Administrador para o Residente -->
        <div v-if="auth.isAdmin" class="pt-3 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            @click="openEditResidentModal(selectedResident)"
            class="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 class="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            @click="handleDeleteResident(selectedResident)"
            class="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CADASTRO / EDIÇÃO DE IDOSO -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto space-y-3.5">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-sm">
            {{ isEditing ? 'Editar Residente' : 'Novo Idoso Residente' }}
          </h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSaveResident" class="space-y-3">
          <!-- Foto com opção de tirar ou escolher -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Foto do Residente</label>
            <div class="flex items-center gap-3">
              <img
                :src="residentForm.photoUrl"
                alt="Foto"
                class="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div class="space-y-1">
                <button
                  type="button"
                  @click="handlePhotoCapture"
                  class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1"
                >
                  <Camera class="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>
                <div class="flex gap-1">
                  <button
                    v-for="(av, i) in defaultAvatars"
                    :key="i"
                    type="button"
                    @click="residentForm.photoUrl = av"
                    class="w-5 h-5 rounded-full overflow-hidden border border-slate-300 hover:scale-110 transition-transform"
                  >
                    <img :src="av" class="w-full h-full object-cover" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Nome -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              v-model="residentForm.name"
              required
              placeholder="Ex: Benedito de Sousa"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <!-- Quarto e Idade em 2 Colunas -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Quarto / Leito</label>
              <input
                type="text"
                v-model="residentForm.room"
                placeholder="Ex: Quarto 104 - A"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Idade (anos)</label>
              <input
                type="number"
                v-model="residentForm.age"
                min="50"
                max="120"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <!-- Condições de Saúde / Alergias -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Condições de Saúde / Alergias</label>
            <input
              type="text"
              v-model="residentForm.healthConditionsText"
              placeholder="Separadas por vírgula (Ex: Hipertensão, Alergia a Dipirona)"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400 mb-1.5"
            />
            <div class="flex flex-wrap gap-1">
              <button
                v-for="cond in quickConditions"
                :key="cond"
                type="button"
                @click="toggleCondition(cond)"
                class="text-[10px] px-1.5 py-0.5 rounded-lg border bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                + {{ cond }}
              </button>
            </div>
          </div>

          <!-- Observações Gerais -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Observações de Cuidados</label>
            <textarea
              v-model="residentForm.notes"
              rows="2"
              placeholder="Ex: Uso de andador, dificuldade de deglutição..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            ></textarea>
          </div>

          <!-- Botões Salvar / Cancelar -->
          <div class="pt-2 flex gap-2">
            <button
              type="button"
              @click="isModalOpen = false"
              class="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
            >
              {{ isEditing ? 'Salvar Alterações' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
