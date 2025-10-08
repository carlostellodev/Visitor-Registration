import { defineStore } from 'pinia'
import api from '../utils/api'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [],
    loading: false,
    error: null,
  }),

  getters: {
    activeDocuments: (state) => state.documents.filter((d) => d.isActive),
    requiredDocuments: (state) => state.documents.filter((d) => d.isRequired && d.isActive),
    documentCount: (state) => state.documents.length,
  },

  actions: {
    async fetchDocumentsByTenant(tenantId) {
      this.loading = true
      this.error = null

      try {
        const response = await api.get(`/documents/tenant/${tenantId}`)
        this.documents = response.data.documents
        return response.data.documents
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar documentos'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearDocuments() {
      this.documents = []
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },

  persist: true,
})
