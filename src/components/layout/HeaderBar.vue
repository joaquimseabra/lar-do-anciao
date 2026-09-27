<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicationStore } from '@/stores/medicationStore'
import { HeartPulse, CheckCircle2, ShieldCheck, BellOff } from 'lucide-vue-next'

const router = useRouter()
const store = useMedicationStore()

const todayFormatted = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'short' }
  const str = new Date().toLocaleDateString('pt-BR', options)
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const navigateToProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <header class="bg-slate-900 text-white shadow-md sticky top-0 z-40">
    <!-- Feedback Toast -->
    <transition
      enter-active-class="transform transition ease-out duration-300"
      enter-from-class="-translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="store.notificationMessage" 
        class="bg-emerald-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 shadow-inner"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-100 flex-shrink-0" />
        <span>{{ store.notificationMessage }}</span>
      </div>
    </transition>

    <div class="px-4 py-3 max-w-md mx-auto flex items-center justify-between">
      <!-- Título Institucional e Data -->
      <div>
        <h1 class="font-bold text-base tracking-tight text-white leading-none">Lar do Ancião</h1>
        <p class="text-[11px] text-slate-400 mt-1 capitalize">{{ todayFormatted }}</p>
      </div>

      <!-- Avatar Cuidadora -->
      <button 
        @click="navigateToProfile"
        class="relative focus:outline-none rounded-full"
        title="Perfil"
      >
        <img 
          :src="store.currentCaregiver?.avatar" 
          :alt="store.currentCaregiver?.name"
          class="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700 hover:ring-slate-500 transition-all"
        />
        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
      </button>
    </div>
  </header>
</template>
