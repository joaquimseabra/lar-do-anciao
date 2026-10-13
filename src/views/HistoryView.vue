<script setup>
import { ref, computed } from 'vue'
import { useMedicationStore } from '@/stores/medicationStore'
import { 
  History, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Search, 
  Calendar, 
  X, 
  Pill,
  ShieldCheck,
  RotateCcw
} from 'lucide-vue-next'

const store = useMedicationStore()
const filterQuery = ref('')
const selectedResidentFilter = ref('')
const selectedShiftFilter = ref('all') // 'all', 'morning', 'afternoon', 'night'

const filteredHistory = computed(() => {
  let list = store.todayHistory

  // Filtro por idoso selecionado
  if (selectedResidentFilter.value) {
    list = list.filter(item => item.residentId === selectedResidentFilter.value)
  }

  // Filtro por turno / período
  if (selectedShiftFilter.value !== 'all') {
    list = list.filter(item => {
      if (!item.administeredAt) return true
      const date = new Date(item.administeredAt)
      const hours = date.getHours()
      if (selectedShiftFilter.value === 'morning') return hours >= 6 && hours < 12
      if (selectedShiftFilter.value === 'afternoon') return hours >= 12 && hours < 18
      if (selectedShiftFilter.value === 'night') return hours >= 18 || hours < 6
      return true
    })
  }

  // Filtro por texto livre
  if (filterQuery.value) {
    const q = filterQuery.value.toLowerCase()
    list = list.filter(item => 
      item.residentName.toLowerCase().includes(q) ||
      item.medicationName.toLowerCase().includes(q) ||
      item.caregiverName.toLowerCase().includes(q) ||
      (item.residentRoom && item.residentRoom.toLowerCase().includes(q))
    )
  }

  return list
})

const clearAllFilters = () => {
  filterQuery.value = ''
  selectedResidentFilter.value = ''
  selectedShiftFilter.value = 'all'
}

const hasActiveFilters = computed(() => {
  return filterQuery.value !== '' || selectedResidentFilter.value !== '' || selectedShiftFilter.value !== 'all'
})

const formatTimeOnly = (isoString) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return isoString
  }
}

const handleUndo = (item) => {
  if (confirm(`Deseja desfazer a administração de ${item.medicationName} para ${item.residentName}? O remédio voltará à lista de pendências.`)) {
    store.undoAdministration(item.id)
  }
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Cabeçalho Minimalista -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h2 class="text-base font-bold text-slate-900">Histórico de Hoje</h2>
        <p class="text-xs text-slate-500">Auditoria das doses administradas</p>
      </div>

      <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        {{ store.todayHistory.length }} tomadas
      </span>
    </div>

    <!-- Barra de Filtro Minimalista -->
    <div class="space-y-2">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search class="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          v-model="filterQuery"
          placeholder="Filtrar por idoso, remédio ou cuidadora..."
          class="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
        />
        <button
          v-if="filterQuery"
          @click="filterQuery = ''"
          class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filtros Rápidos por Turno e Idoso -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        <button
          type="button"
          @click="selectedShiftFilter = 'all'"
          :class="selectedShiftFilter === 'all' ? 'bg-navy-800 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
        >
          Todos os Turnos
        </button>
        <button
          type="button"
          @click="selectedShiftFilter = 'morning'"
          :class="selectedShiftFilter === 'morning' ? 'bg-navy-800 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
        >
          🌅 Manhã (06h-12h)
        </button>
        <button
          type="button"
          @click="selectedShiftFilter = 'afternoon'"
          :class="selectedShiftFilter === 'afternoon' ? 'bg-navy-800 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
        >
          ☀️ Tarde (12h-18h)
        </button>
        <button
          type="button"
          @click="selectedShiftFilter = 'night'"
          :class="selectedShiftFilter === 'night' ? 'bg-navy-800 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
        >
          🌙 Noite (18h-06h)
        </button>
      </div>

      <!-- Seletor de Idoso e Limpar Filtros -->
      <div class="flex items-center gap-2">
        <select
          v-model="selectedResidentFilter"
          class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          <option value="">Todos os Residentes ({{ store.residents.length }})</option>
          <option v-for="res in store.residents" :key="res.id" :value="res.id">
            {{ res.name }} {{ res.room ? `(${res.room})` : '' }}
          </option>
        </select>

        <button
          v-if="hasActiveFilters"
          type="button"
          @click="clearAllFilters"
          class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs flex-shrink-0 transition-colors font-medium"
        >
          Limpar
        </button>
      </div>
    </div>

    <!-- Lista de Registros Auditáveis -->
    <div v-if="filteredHistory.length > 0" class="space-y-2">
      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
      >
        <!-- Idoso e Remédio -->
        <div class="flex items-center gap-3 min-w-0">
          <img
            :src="item.residentPhoto"
            :alt="item.residentName"
            class="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div class="min-w-0">
            <h4 class="font-bold text-slate-900 text-sm truncate leading-snug">
              {{ item.residentName }}
            </h4>
            <p class="text-[11px] text-slate-400 truncate" v-if="item.residentRoom">
              {{ item.residentRoom }}
            </p>
            <p class="text-xs text-slate-700 truncate">
              {{ item.medicationName }} <span class="font-bold text-slate-500">({{ item.dosage }})</span>
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5 truncate">
              Por {{ item.caregiverName?.split(' ')[0] }} às {{ formatTimeOnly(item.administeredAt) }}
            </p>
          </div>
        </div>

        <!-- Ação / Selo Tomado -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            @click="handleUndo(item)"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Desfazer dose confirmada"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
          <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            ✓ Tomado
          </span>
        </div>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div
      v-else
      class="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-2xs"
    >
      Nenhuma dose confirmada hoje ainda.
    </div>
  </div>
</template>
