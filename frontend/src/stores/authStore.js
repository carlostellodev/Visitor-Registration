import { defineStore } from 'pinia'
import api from '../utils/api'

import { useDocumentStore } from './documentStore'
import { useVisitStore } from './visitStore'
import { useWorkerStore } from './workerStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    tenant: null,
    token: null,
    loading: false,
    error: null,
    rateLimitInfo: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    tenantSlug: (state) => state.tenant?.slug || null,
    tenantTheme: (state) => state.tenant?.theme || null,
    isRateLimited: (state) => !!state.rateLimitInfo,
  },

  actions: {
    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post('/auth/register', userData)
        this.token = data.token
        this.user = data.user
        this.tenant = data.user.tenant || null

        return data
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
      this.rateLimitInfo = null

      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token
        this.user = data.user
        this.tenant = data.user.tenant

        return data
      } catch (error) {
        const response = error.response?.data

        // Manejar error de rate limiting (429)
        if (error.response?.status === 429) {
          this.rateLimitInfo = {
            message: response.message,
            details: response.details,
            lockedUntil: response.lockedUntil,
          }
          this.error = response.details || response.message
        }
        // Manejar credenciales inválidas (401)
        else if (error.response?.status === 401) {
          this.error = response.message || 'Credenciales inválidas'
          if (response.hint) {
            this.error += `. ${response.hint}`
          }
        }
        // Manejar cuenta inactiva (403)
        else if (error.response?.status === 403) {
          this.error = response.message || 'Acceso denegado'
          if (response.hint) {
            this.error += `. ${response.hint}`
          }
        } else {
          this.error = response?.message || 'Error en el login'
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/auth/getUser')
        this.user = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isActive: data.user.isActive,
          createdAt: data.user.createdAt,
        }
        this.tenant = data.user.tenant

        return data
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

      useDocumentStore().clearDocuments()
      useVisitStore().clearVisit()
      useWorkerStore().clearWorkers()
    },

    clearError() {
      this.error = null
      this.rateLimitInfo = null
    },
  },
  persist: true, // Por el plugin pinia-plugin-persistedstate
})
