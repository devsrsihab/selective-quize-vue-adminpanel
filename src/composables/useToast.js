// admin/js/admin-app/src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  function show(message, type = 'success', duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      dismiss(id)
    }, duration)
  }

  function dismiss(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message) { show(message, 'success') }
  function error(message)   { show(message, 'error', 5000) }
  function info(message)    { show(message, 'info') }

  return { toasts, success, error, info, dismiss }
}
