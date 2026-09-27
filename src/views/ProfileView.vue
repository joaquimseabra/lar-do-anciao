<script setup>
import { computed } from 'vue'
import { useMedicationStore, AVAILABLE_CAREGIVERS } from '@/stores/medicationStore'
import { isConfigured } from '@/services/firebase'
import { 
  UserCircle, 
  ShieldCheck, 
  Cloud, 
  CloudOff, 
  RotateCcw, 
  Smartphone, 
  Heart, 
  CheckCircle2, 
  Info,
  ExternalLink,
  Users
} from 'lucide-vue-next'

const store = useMedicationStore()

const handleCaregiverChange = (caregiver) => {
  store.setCurrentCaregiver(caregiver)
}

const handleResetDemo = () => {
  if (confirm('Deseja realmente restaurar todos os dados iniciais de exemplo do Lar do Ancião?')) {
    store.resetToDemoData()
  }
}
</script>

<template>
  <div class="px-4 py-4 max-w-md mx-auto space-y-3.5">
    <!-- Cartão do Usuário Conectado -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
      <div class="relative">
        <img
          :src="store.currentCaregiver?.avatar"
          :alt="store.currentCaregiver?.name"
          class="w-13 h-13 rounded-full object-cover border border-slate-200"
        />
        <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
      </div>

      <div class="min-w-0">
        <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
          {{ store.currentCaregiver?.role }}
        </span>
        <h2 class="text-base font-bold text-slate-900 mt-1 truncate">
          {{ store.currentCaregiver?.name }}
        </h2>
        <p class="text-xs text-slate-500">Plantão ativo no Lar do Ancião</p>
      </div>
    </div>

    <!-- Alternar Cuidadora Ativa -->
    <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-slate-900 text-xs">Trocar Cuidadora (Auditoria)</h3>
        <span class="text-[10px] text-slate-400">Assinatura de dose</span>
      </div>

      <div class="space-y-1.5">
        <button
          v-for="cg in AVAILABLE_CAREGIVERS"
          :key="cg.id"
          type="button"
          @click="handleCaregiverChange(cg)"
          class="w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all"
          :class="[
            store.currentCaregiver?.id === cg.id 
              ? 'bg-blue-50/70 border-blue-300 text-blue-900 ring-1 ring-blue-400' 
              : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <img :src="cg.avatar" :alt="cg.name" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
            <div>
              <h4 class="text-xs font-bold leading-tight">{{ cg.name }}</h4>
              <p class="text-[10px] text-slate-500">{{ cg.role }}</p>
            </div>
          </div>

          <span v-if="store.currentCaregiver?.id === cg.id" class="text-blue-600">
            <CheckCircle2 class="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>

    <!-- Status Sincronização & Reset -->
    <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-slate-700">Sincronização</span>
        <span 
          class="text-[10px] font-bold px-2 py-0.5 rounded-full"
          :class="isConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
        >
          {{ isConfigured ? 'Firebase Conectado' : 'Modo Local (Offline)' }}
        </span>
      </div>

      <div class="pt-2 border-t border-slate-100">
        <button
          type="button"
          @click="handleResetDemo"
          class="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restaurar dados de exemplo</span>
        </button>
      </div>
    </div>
  </div>
</template>
