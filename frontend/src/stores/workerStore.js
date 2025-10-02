import { defineStore } from 'pinia'
import api from '../utils/api'

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    workers: [],
    currentWorker: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeWorkers: (state) => state.workers.filter((w) => w.isActive),
    workerOptions: (state) =>
      state.workers.map((w) => ({
        title: w.name,
        value: w._id,
      })),
  },

  actions: {
    async fetchWorkersByTenant(tenantId) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/workers/tenant/${tenantId}`)
        this.workers = response.data.workers

        return this.workers
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar responsables'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createWorker(workerData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/workers', workerData)
        this.workers.push(response.data.worker)
        return response.data.worker
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear responsable'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateWorker(id, workerData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put(`/workers/${id}`, workerData)
        const index = this.workers.findIndex((w) => w._id === id)
        if (index !== -1) {
          this.workers[index] = response.data.worker
        }
        return response.data.worker
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar responsable'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteWorker(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/workers/${id}`)
        this.workers = this.workers.filter((w) => w._id !== id)
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar responsable'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },
  },
  persist: true, // Por el plugin pinia-plugin-persistedstate
})
