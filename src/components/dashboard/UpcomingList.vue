<script setup>
import { ref, computed } from 'vue'
import { useMedicationStore } from '@/stores/medicationStore'
import { Clock, Check, Calendar, Filter } from 'lucide-vue-next'

const store = useMedicationStore()
const confirmingId = ref(null)
const selectedTimeFilter = ref('all')

const availableTimes = computed(() => {
  const times = new Set(store.upcomingMedications.map(m => m.scheduledTime))
  return Array.from(times).sort()
})

const filteredList = computed(() => {
  if (selectedTimeFilter.value === 'all') {
    return store.upcomingMedications
  }
  return store.upcomingMedications.filter(m => m.scheduledTime === selectedTimeFilter.value)
})

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
  <section>
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-2 px-0.5">
      <h3 class="font-bold text-slate-900 text-sm">
        Próximos Medicamentos
      </h3>
      <span 
        v-if="store.upcomingMedications.length > 0"
        class="text-xs font-semibold text-slate-500"
      >
        {{ store.upcomingMedications.length }} agendado{{ store.upcomingMedications.length > 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Lista com Próximos Remédios -->
    <div v-if="store.upcomingMedications.length > 0" class="space-y-2.5">
      <div
        v-for="item in store.upcomingMedications"
        :key="item.slotId"
        class="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
      >
        <!-- Idoso e Remédio -->
        <div class="flex items-center gap-3 min-w-0">
          <img
            :src="item.residentPhoto"
            :alt="item.residentName"
            class="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div class="min-w-0">
            <h4 class="font-bold text-slate-900 text-sm truncate leading-snug">
              {{ item.residentName }}
            </h4>
            <p class="text-xs font-semibold text-slate-700 truncate">
              {{ item.medicationName }} <span class="font-bold text-slate-500">({{ item.dosage }})</span>
            </p>
            <p class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Horário:</span>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px]">
                {{ item.scheduledTime }}
              </span>
            </p>
          </div>
        </div>

        <!-- Botão Azul Marinho Direto -->
        <button
          @click="handleConfirm(item)"
          :disabled="confirmingId === item.slotId"
          class="flex-shrink-0 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
        >
          {{ confirmingId === item.slotId ? '...' : 'Confirmar' }}
        </button>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div
      v-else
      class="bg-white border border-slate-200/80 rounded-2xl p-4 text-center text-xs text-slate-500"
    >
      Nenhum próximo medicamento pendente.
    </div>
  </section>
</template>
