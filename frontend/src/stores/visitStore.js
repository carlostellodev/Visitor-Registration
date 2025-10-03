// src/stores/visit.js
import { defineStore } from 'pinia'

export const useVisitStore = defineStore('visit', {
  state: () => ({
    formData: {
      name: '',
      tenant: '',
      plate: '',
      worker: null,
      purpose: [],
      accessZone: [],
    },
    currentStep: null,
    acceptedDocuments: [],
    signature: null,
  }),

  actions: {
    saveFormData(data) {
      this.formData = { ...this.formData, ...data }
    },

    saveCurrentStep(step) {
      this.currentStep = step
    },

    saveAcceptedDocuments(documentIds) {
      this.acceptedDocuments = documentIds
    },

    saveSignature(signatureData) {
      this.signature = signatureData
    },

    clearVisit() {
      this.formData = {
        name: '',
        tenant: '',
        plate: '',
        worker: null,
        purpose: [],
        accessZone: [],
      }
      this.currentStep = null
      this.acceptedDocuments = []
      this.signature = null
    },
  },

  persist: true,
})
