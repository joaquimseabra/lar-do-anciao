import { defineStore } from 'pinia'
import * as authService from '../services/authService.js'
import { useMedicationStore, AVAILABLE_CAREGIVERS } from './medicationStore.js'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: authService.getCurrentUser()
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.papel === 'admin'
  },

  actions: {
    async login(email, password, remember) {
      this.user = await authService.login(email, password, remember)

      // A cuidadora logada passa a ser quem assina as doses confirmadas
      const caregiver = AVAILABLE_CAREGIVERS.find(cg => cg.id === this.user.caregiverId)
      if (caregiver) useMedicationStore().setCurrentCaregiver(caregiver)
    },

    async logout() {
      await authService.logout()
      this.user = null
    },

    sendPasswordReset(email) {
      return authService.sendPasswordReset(email)
    }
  }
})
