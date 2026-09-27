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
  ShieldCheck
} from 'lucide-vue-next'

const store = useMedicationStore()
const filterQuery = ref('')

const filteredHistory = computed(() => {
  const list = store.todayHistory
  if (!filterQuery.value) return list

  const q = filterQuery.value.toLowerCase()
  return list.filter(item => 
    item.residentName.toLowerCase().includes(q) ||
    item.medicationName.toLowerCase().includes(q) ||
    item.caregiverName.toLowerCase().includes(q)
  )
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
            <p class="text-xs text-slate-700 truncate">
              {{ item.medicationName }} <span class="font-bold text-slate-500">({{ item.dosage }})</span>
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5 truncate">
              Por {{ item.caregiverName?.split(' ')[0] }} às {{ formatTimeOnly(item.administeredAt) }}
            </p>
          </div>
        </div>

        <!-- Selo Tomado -->
        <span class="flex-shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          ✓ Tomado
        </span>
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
