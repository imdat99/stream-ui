import { reactive } from 'vue'

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn'

export interface ToastMessage {
  id: string
  severity: ToastSeverity
  summary: string
  detail?: string
  life?: number
}

interface ToastState {
  messages: ToastMessage[]
}

const state = reactive<ToastState>({
  messages: []
})

let toastIdCounter = 0

export const useToast = () => {
  const add = (message: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastIdCounter}`
    const newMessage: ToastMessage = {
      id,
      life: 3000,
      ...message
    }
    
    state.messages.push(newMessage)
    
    if (newMessage.life && newMessage.life > 0) {
      setTimeout(() => {
        remove(id)
      }, newMessage.life)
    }
    
    return id
  }
  
  const remove = (id: string) => {
    const index = state.messages.findIndex(m => m.id === id)
    if (index > -1) {
      state.messages.splice(index, 1)
    }
  }
  
  const clear = () => {
    state.messages.length = 0
  }
  
  const success = (detail: string, summary: string = 'Success') => {
    return add({ severity: 'success', summary, detail })
  }
  
  const error = (detail: string, summary: string = 'Error') => {
    return add({ severity: 'error', summary, detail })
  }
  
  const info = (detail: string, summary: string = 'Info') => {
    return add({ severity: 'info', summary, detail })
  }
  
  const warn = (detail: string, summary: string = 'Warning') => {
    return add({ severity: 'warn', summary, detail })
  }
  
  return {
    messages: state.messages,
    add,
    remove,
    clear,
    success,
    error,
    info,
    warn
  }
}

// Global toast instance for use outside of components
let globalToastInstance: ReturnType<typeof useToast> | null = null

export const getGlobalToast = () => {
  if (!globalToastInstance) {
    globalToastInstance = useToast()
  }
  return globalToastInstance
}
