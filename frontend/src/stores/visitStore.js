import { defineStore } from 'pinia'

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
  },

  persist: true,
})
