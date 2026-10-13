<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMedicationStore } from '@/stores/medicationStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  LayoutDashboard, 
  Users, 
  Pill, 
  History, 
  UserCircle 
} from 'lucide-vue-next'

const route = useRoute()
const store = useMedicationStore()
const auth = useAuthStore()

const tabs = [
  { name: 'Início', path: '/', icon: LayoutDashboard, badge: 'delayed' },
  { name: 'Idosos', path: '/residents', icon: Users },
  { name: 'Medicamentos', path: '/add-medication', icon: Pill, role: 'admin' },
  { name: 'Histórico', path: '/history', icon: History },
  { name: 'Perfil', path: '/profile', icon: UserCircle }
]

const delayedCount = computed(() => store.delayedMedications.length)
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
    <div class="max-w-md mx-auto px-2 flex items-center justify-around h-16 safe-bottom">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-150 group"
        :class="[
          route.path === tab.path 
            ? 'text-blue-600 font-medium' 
            : 'text-slate-600 hover:text-slate-800'
        ]"
      >
        <!-- Ícone da Aba com badge discreto -->
        <div class="relative">
          <component 
            :is="tab.icon" 
            class="w-5 h-5 transition-transform group-active:scale-90"
            :class="{ 'stroke-[2.2px]': route.path === tab.path }"
          />

          <!-- Badge discreto para Atrasados na aba Início -->
          <span
            v-if="tab.badge === 'delayed' && delayedCount > 0"
            class="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white"
          >
            {{ delayedCount }}
          </span>

          <!-- Tag ADM para a aba restrita a Administrador quando for cuidador -->
          <span
            v-if="tab.role === 'admin' && !auth.isAdmin"
            class="absolute -top-1.5 -right-2 px-1 py-0.2 bg-slate-100 text-slate-500 text-[8px] font-bold rounded border border-slate-300"
          >
            ADM
          </span>
        </div>

        <!-- Rótulo da Aba -->
        <span 
          class="text-[10px] tracking-tight mt-1"
          :class="[
            route.path === tab.path 
              ? 'text-blue-600 font-semibold' 
              : 'text-slate-400 font-medium'
          ]"
        >
          {{ tab.name }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
