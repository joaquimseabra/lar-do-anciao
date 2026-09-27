<script setup>
import { computed } from 'vue'
import { useMedicationStore } from '@/stores/medicationStore'
import DelayedList from '@/components/dashboard/DelayedList.vue'
import UpcomingList from '@/components/dashboard/UpcomingList.vue'
import { 
  Search, 
  X, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RotateCw,
  Sparkles
} from 'lucide-vue-next'

const store = useMedicationStore()

const stats = computed(() => store.stats)

const clearSearch = () => {
  store.searchQuery = ''
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-4">
    <!-- Saudação Minimalista da Cuidadora -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h2 class="text-base font-bold text-slate-900">Olá, {{ store.currentCaregiver?.name?.split(' ')[0] || 'Cuidadora' }} 👋</h2>
        <p class="text-xs text-slate-500">Controle de medicação do plantão</p>
      </div>

      <!-- Badge sutil se houver atrasos -->
      <span 
        v-if="stats.delayedCount > 0" 
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
        {{ stats.delayedCount }} atrasado{{ stats.delayedCount > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Barra de Pesquisa Rápida e Minimalista -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search class="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        v-model="store.searchQuery"
        placeholder="Buscar por idoso ou remédio..."
        class="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
      />
      <button
        v-if="store.searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Bloco 1: Card Vermelho - Medicamentos Atrasados (Conforme Figma) -->
    <DelayedList />

    <!-- Bloco 2: Lista dos Próximos Medicamentos (Conforme Figma) -->
    <UpcomingList />
  </div>
</template>
