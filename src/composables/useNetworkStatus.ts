import { ref } from 'vue'

const isOffline = ref(false)

let listenersCount = 0

function syncNetworkStatus() {
  if (typeof navigator === 'undefined') return

  isOffline.value = !navigator.onLine
}

function handleNetworkStatusChange() {
  syncNetworkStatus()
}

function startListening() {
  if (typeof window === 'undefined') return

  if (listenersCount === 0) {
    syncNetworkStatus()
    window.addEventListener('online', handleNetworkStatusChange)
    window.addEventListener('offline', handleNetworkStatusChange)
  }

  listenersCount += 1
}

function stopListening() {
  if (typeof window === 'undefined' || listenersCount === 0) return

  listenersCount -= 1

  if (listenersCount === 0) {
    window.removeEventListener('online', handleNetworkStatusChange)
    window.removeEventListener('offline', handleNetworkStatusChange)
  }
}

export function useNetworkStatus() {
  return {
    isOffline,
    syncNetworkStatus,
    startListening,
    stopListening,
  }
}
