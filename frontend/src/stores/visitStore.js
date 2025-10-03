// src/stores/visit.js
import { defineStore } from 'pinia'

export const useVisitStore = defineStore('visit', {
  state: () => ({
    formData: {
      name: '',
      company: '',
      plate: '',
      worker: null,
      purpose: [],
      area: [],
    },
    acceptedDocuments: [],
    signature: null,
  }),

  actions: {
    saveFormData(data) {
      this.formData = { ...this.formData, ...data }
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
        company: '',
        plate: '',
        worker: null,
        purpose: [],
        area: [],
      }
      this.acceptedDocuments = []
      this.signature = null
    },
  },

  persist: true,
})
