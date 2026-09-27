import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import ResidentsView from '@/views/ResidentsView.vue'
import AddMedicationView from '@/views/AddMedicationView.vue'
import HistoryView from '@/views/HistoryView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
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
    meta: { title: 'Cadastrar Medicamento' }
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

export default router
