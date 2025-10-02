import { useToast } from 'vue-toastification'

export function useToastComposable() {
  const toast = useToast()
  const showToast = (string, type) => {
    if (type === 'success') {
      toast.success(string)
      return
    }
    if (type === 'error') {
      toast.error(string)
      return
    }
    if (type === 'info') {
      toast.info(string)
      return
    }
    toast.success(string)
  }
  return { showToast }
}
