<script setup>
import { ref, computed } from 'vue'
import { useMedicationStore } from '@/stores/medicationStore'
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  Check
} from 'lucide-vue-next'

const store = useMedicationStore()

const searchQuery = ref('')
const isModalOpen = ref(false)

const newResident = ref({
  name: '',
  photoUrl: ''
})

const filteredResidents = computed(() => {
  if (!searchQuery.value) return store.residents
  const q = searchQuery.value.toLowerCase()
  return store.residents.filter(r => r.name.toLowerCase().includes(q))
})

const getResidentMedications = (residentId) => {
  return store.medications.filter(m => m.residentId === residentId)
}

const openNewResidentModal = () => {
  newResident.value = {
    name: '',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
  }
  isModalOpen.value = true
}

const handleAddResident = async () => {
  if (!newResident.value.name) {
    alert('Por favor, informe o nome do idoso residente.')
    return
  }

  await store.addResident(newResident.value)
  isModalOpen.value = false
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Cabeçalho Minimalista -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h2 class="text-base font-bold text-slate-900">Residentes</h2>
        <p class="text-xs text-slate-500">{{ store.residents.length }} idosos cadastrados</p>
      </div>

      <button
        @click="openNewResidentModal"
        class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
      >
        <UserPlus class="w-3.5 h-3.5" />
        <span>+ Novo Idoso</span>
      </button>
    </div>

    <!-- Barra de Busca Minimalista -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search class="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Buscar idoso por nome..."
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

    <!-- Lista de Idosos em Cards Minimalistas -->
    <div class="space-y-2.5">
      <div
        v-for="resident in filteredResidents"
        :key="resident.id"
        class="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs transition-all"
      >
        <div class="flex items-center gap-3">
          <!-- Foto do Residente -->
          <img
            :src="resident.photoUrl"
            :alt="resident.name"
            class="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />

          <!-- Informações Principais: Nome e Remédios -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 text-sm truncate">
              {{ resident.name }}
            </h3>

            <!-- Remédios Prescritos -->
            <div class="mt-1 flex flex-wrap gap-1">
              <span
                v-for="med in getResidentMedications(resident.id)"
                :key="med.id"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
              >
                {{ med.name }} ({{ med.dosage }})
              </span>
              <span v-if="getResidentMedications(resident.id).length === 0" class="text-[11px] text-slate-400 italic">
                Nenhum medicamento ativo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Cadastro de Novo Idoso -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="font-bold text-slate-900 text-sm">Novo Idoso Residente</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddResident" class="space-y-3 mt-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              v-model="newResident.name"
              required
              placeholder="Ex: Benedito de Sousa"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

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
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
