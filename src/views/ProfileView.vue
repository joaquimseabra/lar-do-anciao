<script setup>
import { computed } from 'vue'
import { useMedicationStore, AVAILABLE_CAREGIVERS } from '@/stores/medicationStore'
import { isConfigured } from '@/services/firebase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ref } from 'vue'
import {
  LogOut,
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
  Users,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-vue-next'
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  isNotificationEnabled, 
  setNotificationEnabled, 
  requestNotificationPermission, 
  playAlertBeep,
  sendLocalNotification
} from '@/services/notificationService'

const store = useMedicationStore()
const auth = useAuthStore()
const router = useRouter()

const soundActive = ref(isSoundEnabled())
const notifActive = ref(isNotificationEnabled())

const toggleSound = () => {
  soundActive.value = !soundActive.value
  setSoundEnabled(soundActive.value)
  if (soundActive.value) {
    playAlertBeep()
  }
}

const toggleNotification = async () => {
  if (!notifActive.value) {
    const res = await requestNotificationPermission()
    if (res === 'granted') {
      notifActive.value = true
      sendLocalNotification('Lar do Ancião', 'Notificações de plantão ativadas com sucesso!')
    } else if (res === 'unsupported') {
      alert('Notificações não são suportadas neste navegador.')
    } else {
      alert('Permissão de notificação foi negada pelo navegador.')
    }
  } else {
    notifActive.value = false
    setNotificationEnabled(false)
  }
}

const handleLogout = async () => {
  await auth.logout()
  router.replace('/login')
}

const handleCaregiverChange = (caregiver) => {
  store.setCurrentCaregiver(caregiver)
  auth.switchCaregiver(caregiver.id)
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

    <!-- Alertas Sonoros & Notificações Locais (Plantão) -->
    <div class="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
          <Bell class="w-3.5 h-3.5 text-navy-800" />
          <span>Alertas do Plantão (100% Offline)</span>
        </h3>
        <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
          Sem servidor
        </span>
      </div>

      <div class="space-y-2 pt-1">
        <!-- Sinal Sonoro -->
        <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div class="flex items-center gap-2">
            <component :is="soundActive ? Volume2 : VolumeX" class="w-4 h-4 text-slate-600" />
            <div>
              <p class="text-xs font-bold text-slate-800">Sinal Sonoro de Remédio</p>
              <p class="text-[10px] text-slate-500">Toca um alerta agradável nas doses</p>
            </div>
          </div>
          <button
            type="button"
            @click="toggleSound"
            :class="soundActive ? 'bg-emerald-600' : 'bg-slate-300'"
            class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
          >
            <span
              :class="soundActive ? 'translate-x-4' : 'translate-x-0'"
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            />
          </button>
        </div>

        <!-- Notificação Local -->
        <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <div class="flex items-center gap-2">
            <component :is="notifActive ? Bell : BellOff" class="w-4 h-4 text-slate-600" />
            <div>
              <p class="text-xs font-bold text-slate-800">Notificações no Dispositivo</p>
              <p class="text-[10px] text-slate-500">Avisa na tela quando vencer o horário</p>
            </div>
          </div>
          <button
            type="button"
            @click="toggleNotification"
            :class="notifActive ? 'bg-emerald-600' : 'bg-slate-300'"
            class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
          >
            <span
              :class="notifActive ? 'translate-x-4' : 'translate-x-0'"
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            />
          </button>
        </div>
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

    <!-- Sessão -->
    <button
      type="button"
      @click="handleLogout"
      class="w-full py-2.5 px-3 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
    >
      <LogOut class="w-3.5 h-3.5" />
      <span>Sair ({{ auth.user?.email }})</span>
    </button>
  </div>
</template>
