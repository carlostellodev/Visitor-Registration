import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useVisitStore = defineStore('visit', {
  state: () => ({
    formData: {
      name: '',
      company: '',
      plate: '',
      worker: null,
      purpose: [],
      accessZone: [],
    },
    acceptedDocuments: [],

    // Control de navegación
    currentStep: 0,
    completedSteps: {
      home: false,
      legal: false,
      signature: false,
    },
    navigationAllowed: true,

    visitors: [],
  }),

  getters: {
    hasCompletedHome: (state) => state.completedSteps.home,
    hasCompletedLegal: (state) => state.completedSteps.legal,
    canAccessLegal: (state) => state.completedSteps.home,
    canAccessSignature: (state) => state.completedSteps.home && state.completedSteps.legal,
    isFormDataValid: (state) => {
      return !!(
        state.formData.name &&
        state.formData.company &&
        state.formData.worker &&
        state.formData.purpose.length > 0 &&
        state.formData.accessZone.length > 0
      )
    },
  },

  actions: {
    saveFormData(data) {
      this.formData = { ...this.formData, ...data }
      this.completedSteps.home = true
    },

    saveCurrentStep(step) {
      this.currentStep = step
    },

    saveAcceptedDocuments(documentIds) {
      this.acceptedDocuments = documentIds
    },

    markLegalComplete() {
      this.completedSteps.legal = true
    },

    saveVisitors(visitors) {
      this.visitors = visitors
    },

    clearVisit() {
      this.formData = {
        name: '',
        company: '',
        plate: '',
        purpose: [],
        accessZone: [],
        worker: null,
      }
      this.acceptedDocuments = []
      this.currentStep = 0
      this.completedSteps = {
        home: false,
        legal: false,
        signature: false,
      }
      this.visitors = []
    },

    // Validar si puede navegar a una ruta específica
    canNavigateTo(routeName) {
      switch (routeName) {
        case 'Home':
          return true // Siempre puede volver al inicio
        case 'Legal':
          return this.canAccessLegal
        case 'Signature':
          return this.canAccessSignature
        default:
          return false
      }
    },

    async fetchVisitorsByDate(tenantId, date) {
      try {
        const { data } = await api.get(`/visitors/tenant/${tenantId}/date/${date}`)
        this.visitors = data.visitors
        return data.visitors
      } catch (error) {
        console.error('Error fetching visitors by date:', error)
        throw error
      }
    },

    async exportVisitors(tenantId, startDate, endDate, format) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post(
          '/visitors/export',
          {
            tenantId,
            startDate,
            endDate,
            format,
          },
          {
            responseType: 'blob',
          },
        )

        const filename = `Visitantes_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`

        // Crear enlace de descarga
        const blob = new Blob([response.data], {
          type:
            format === 'pdf'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Limpiar
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al exportar'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteVisitor(id) {
      try {
        const res = await api.delete(`/visitors/${id}`)
        return res
      } catch (error) {
        console.error('Error deleting visitor:', error)
        throw error
      }
    },
  },

  persist: true,
})
