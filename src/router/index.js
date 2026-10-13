import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import ResidentsView from '@/views/ResidentsView.vue'
import AddMedicationView from '@/views/AddMedicationView.vue'
import HistoryView from '@/views/HistoryView.vue'
import ProfileView from '@/views/ProfileView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMedicationStore } from '@/stores/medicationStore'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Entrar', public: true, hideChrome: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Início — Controle Diário' }
  },
  {
    path: '/residents',
    name: 'residents',
    component: ResidentsView,
    meta: { title: 'Idosos Residentes' }
  },
  {
    path: '/add-medication',
    name: 'add-medication',
    component: AddMedicationView,
    meta: { title: 'Cadastrar Medicamento', requiredRole: 'admin' }
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { title: 'Histórico de Doses' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'Perfil & Acesso' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Redireciona quem não está logado para /login e protege rotas administrativas com RBAC
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 1. Não autenticado -> login
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  }

  // 2. Já autenticado tentando acessar /login -> dashboard
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // 3. RBAC: Rota exige papel de Administrador
  if (to.meta.requiredRole === 'admin' && !auth.isAdmin) {
    try {
      const medStore = useMedicationStore()
      medStore.notifySuccess('Apenas Administradores podem cadastrar novos medicamentos.')
    } catch (e) {
      // Ignorar se store não estiver pronto
    }
    return { name: 'dashboard' }
  }
})

export default router
