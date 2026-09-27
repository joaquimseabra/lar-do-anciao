<script setup>
import { ref } from 'vue'
import { useMedicationStore } from '@/stores/medicationStore'
import { AlertTriangle, Clock, Check, Sparkles, AlertCircle } from 'lucide-vue-next'

const store = useMedicationStore()
const confirmingId = ref(null)

const handleConfirm = async (slot) => {
  confirmingId.value = slot.slotId
  try {
    await store.confirmMedication(slot)
  } finally {
    confirmingId.value = null
  }
}
</script>

<template>
  <section class="mb-4">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-2 px-0.5">
      <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        Medicamentos Atrasados
      </h3>
      <span 
        v-if="store.delayedMedications.length > 0"
        class="text-xs font-bold text-red-600"
      >
        {{ store.delayedMedications.length }} pendente{{ store.delayedMedications.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Lista com Atrasados -->
    <div v-if="store.delayedMedications.length > 0" class="space-y-2.5">
      <div
        v-for="item in store.delayedMedications"
        :key="item.slotId"
        class="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
      >
        <!-- Idoso e Remédio -->
        <div class="flex items-center gap-3 min-w-0">
          <img
            :src="item.residentPhoto"
            :alt="item.residentName"
            class="w-11 h-11 rounded-xl object-cover border border-red-200 flex-shrink-0"
          />
          <div class="min-w-0">
            <h4 class="font-bold text-slate-900 text-sm truncate leading-snug">
              {{ item.residentName }}
            </h4>
            <p class="text-xs font-semibold text-red-900 truncate">
              {{ item.medicationName }} <span class="font-bold text-red-700">({{ item.dosage }})</span>
            </p>
            <p class="text-[11px] text-slate-500 mt-0.5">
              Previsto: <span class="text-red-600 font-semibold">{{ item.scheduledTime }}</span>
            </p>
          </div>
        </div>

        <!-- Botão Confirmar Direto -->
        <button
          @click="handleConfirm(item)"
          :disabled="confirmingId === item.slotId"
          class="flex-shrink-0 px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {{ confirmingId === item.slotId ? '...' : 'Confirmar' }}
        </button>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div
      v-else
      class="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3 text-center text-xs text-emerald-800 font-medium"
    >
      ✨ Nenhuma medicação atrasada no momento.
    </div>
  </section>
</template>
