import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    tenant: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  persist: true, // Por el plugin pinia-plugin-persistedstate

  getters: {
    isAuthenticated: (state) => !!state.token,
    tenantSlug: (state) => state.tenant?.slug || null,
    tenantTheme: (state) => state.tenant?.theme || null,
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/register', userData)

        this.token = response.data.token
        this.user = response.data.user
        this.tenant = response.data.user.tenant || null

        localStorage.setItem('token', this.token)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error en el registro'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/login', {
          email,
          password,
        })

        this.token = response.data.token
        this.user = response.data.user
        this.tenant = response.data.user.tenant

        localStorage.setItem('token', this.token)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error en el login'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/auth/getUser')

        this.user = {
          _id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          isActive: response.data.user.isActive,
          createdAt: response.data.user.createdAt,
        }
        this.tenant = response.data.user.tenant

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al obtener perfil'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.tenant = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
    },

    clearError() {
      this.error = null
    },
  },
})
