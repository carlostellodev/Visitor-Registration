import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    // Registro
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/register', userData)
        this.token = response.data.token
        this.user = response.data.user

        // Guardar en localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error en el registro'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Login
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/login', credentials)
        this.token = response.data.token
        this.user = response.data.user

        // Guardar en localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error en el login'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Logout
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // Obtener perfil del usuario
    async fetchProfile() {
      const user_id = this.user?.id
      try {
        const response = await api.get('/auth/getUser', user_id)
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response.data.user
      } catch (error) {
        this.logout()
        throw error
      }
    },
  },
})
