<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { DEMO_ACCOUNTS } from '@/services/authService'
import { isConfigured } from '@/services/firebase'
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const submitted = ref(false)
const touched = ref({ email: false, password: false })
const loading = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailError = computed(() => {
  if (!email.value.trim()) return 'Informe seu e-mail institucional.'
  if (!EMAIL_REGEX.test(email.value.trim())) return 'Digite um e-mail válido.'
  return ''
})

const passwordError = computed(() => {
  if (!password.value) return 'Informe sua senha.'
  if (password.value.length < 6) return 'A senha deve ter no mínimo 6 caracteres.'
  return ''
})

const showEmailError = computed(() => (submitted.value || touched.value.email) && emailError.value)
const showPasswordError = computed(() => (submitted.value || touched.value.password) && passwordError.value)

const handleSubmit = async () => {
  submitted.value = true
  errorMessage.value = ''
  infoMessage.value = ''
  if (emailError.value || passwordError.value) return

  loading.value = true
  try {
    await auth.login(email.value, password.value, remember.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect)
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  errorMessage.value = ''
  infoMessage.value = ''
  touched.value.email = true
  if (emailError.value) {
    errorMessage.value = 'Digite seu e-mail acima para recuperar a senha.'
    return
  }

  try {
    await auth.sendPasswordReset(email.value)
    infoMessage.value = isConfigured
      ? `Enviamos um link de recuperação para ${email.value.trim()}.`
      : 'Modo local: em produção, um link de recuperação será enviado para este e-mail.'
  } catch (err) {
    errorMessage.value = err.message
  }
}

const fillDemoAccount = (account) => {
  email.value = account.email
  password.value = account.password
  errorMessage.value = ''
  infoMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Cabeçalho Institucional -->
    <div class="bg-slate-900 text-white px-6 pt-14 pb-12 text-center">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
        <HeartPulse class="w-7 h-7 text-white" />
      </div>
      <h1 class="mt-4 text-xl font-bold tracking-tight">Lar do Ancião</h1>
      <p class="text-xs text-slate-400 mt-1">Controle de medicação dos residentes</p>
    </div>

    <div class="flex-1 px-4 -mt-6 pb-8 space-y-3.5">
      <!-- Formulário de Login -->
      <form
        novalidate
        @submit.prevent="handleSubmit"
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-4"
      >
        <div>
          <h2 class="text-base font-bold text-slate-900">Entrar</h2>
          <p class="text-xs text-slate-500 mt-0.5">Use seu e-mail institucional e senha.</p>
        </div>

        <!-- Alertas -->
        <div
          v-if="errorMessage"
          role="alert"
          class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-3 py-2.5"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0 mt-px" />
          <span>{{ errorMessage }}</span>
        </div>
        <div
          v-if="infoMessage"
          role="status"
          class="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl px-3 py-2.5"
        >
          <CheckCircle2 class="w-4 h-4 flex-shrink-0 mt-px" />
          <span>{{ infoMessage }}</span>
        </div>

        <!-- E-mail -->
        <div class="space-y-1">
          <label for="login-email" class="text-xs font-semibold text-slate-700">E-mail institucional</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="username"
              autocapitalize="none"
              placeholder="nome@lardoanciao.org"
              @blur="touched.email = true"
              :aria-invalid="!!showEmailError"
              class="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors"
              :class="showEmailError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'"
            />
          </div>
          <p v-if="showEmailError" class="text-[11px] text-red-600">{{ emailError }}</p>
        </div>

        <!-- Senha -->
        <div class="space-y-1">
          <label for="login-password" class="text-xs font-semibold text-slate-700">Senha</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Mínimo de 6 caracteres"
              @blur="touched.password = true"
              :aria-invalid="!!showPasswordError"
              class="w-full pl-9 pr-10 py-2.5 rounded-xl border bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors"
              :class="showPasswordError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="showPasswordError" class="text-[11px] text-red-600">{{ passwordError }}</p>
        </div>

        <!-- Lembrar / Esqueci -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 text-xs text-slate-600 select-none">
            <input
              v-model="remember"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
            />
            Lembrar meu acesso
          </label>
          <button
            type="button"
            @click="handleForgotPassword"
            class="text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <LogIn v-else class="w-4 h-4" />
          <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
        </button>
      </form>

      <!-- Contas de demonstração (somente sem Firebase configurado) -->
      <div
        v-if="!isConfigured"
        class="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2"
      >
        <div class="flex items-center gap-1.5 text-amber-800">
          <Info class="w-3.5 h-3.5" />
          <h3 class="text-xs font-bold">Modo local — contas de demonstração</h3>
        </div>
        <p class="text-[11px] text-amber-700">Toque para preencher. Senha de todas: <strong>123456</strong></p>
        <div class="space-y-1.5">
          <button
            v-for="acc in DEMO_ACCOUNTS"
            :key="acc.email"
            type="button"
            @click="fillDemoAccount(acc)"
            class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-left transition-colors"
          >
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-800 truncate">{{ acc.nome }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ acc.email }}</p>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0"
              :class="acc.papel === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'"
            >
              {{ acc.papel === 'admin' ? 'Administrador' : 'Cuidador' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
