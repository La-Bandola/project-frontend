import { defineStore } from 'pinia'

import api from '@/services/api'
import {
  clearAuthTokens,
  getStoredToken,
  persistAuthTokens,
} from '@/utils/authStorage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: getStoredToken() || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(username, password) {
      const { data } = await api.post('/users/login/', { username, password })
      persistAuthTokens(data.access, data.refresh)
      this.token = data.access
      await this.fetchProfile()
    },

    async register(userData) {
      const { data } = await api.post('/users/register/', userData)
      persistAuthTokens(data.access, data.refresh)
      this.token = data.access
      this.user = data.user
    },

    async fetchProfile() {
      const { data } = await api.get('/users/me/')
      this.user = data
    },

    logout() {
      clearAuthTokens()
      this.token = null
      this.user = null
    },
  },
})