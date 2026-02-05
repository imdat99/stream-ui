import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface DataLoaderOptions<T> {
  key: string
  fetcher: () => Promise<T>
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  refreshInterval?: number
  dedupingInterval?: number
  fallbackData?: T
}

interface DataLoaderState<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isValidating: boolean
}

// Global cache
const cache = new Map<string, { data: any; timestamp: number }>()
const dedupeTimers = new Map<string, number>()
const DEDUPING_INTERVAL = 2000

export function useDataLoader<T>(options: DataLoaderOptions<T>) {
  const route = useRoute()
  const {
    key,
    fetcher,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval,
    fallbackData
  } = options

  const data = ref<T | undefined>(fallbackData)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  const isValidating = ref(false)
  
  let refreshTimer: number | null = null
  let isMounted = false

  const mutate = async (newData?: T): Promise<T | undefined> => {
    if (newData !== undefined) {
      data.value = newData
      cache.set(key, { data: newData, timestamp: Date.now() })
      return newData
    }

    // Dedupe requests
    if (dedupeTimers.has(key)) {
      return data.value
    }

    const dedupeKey = key
    dedupeTimers.set(dedupeKey, window.setTimeout(() => {
      dedupeTimers.delete(dedupeKey)
    }, DEDUPING_INTERVAL))

    isValidating.value = true
    if (!data.value) {
      isLoading.value = true
    }

    try {
      const result = await fetcher()
      data.value = result
      error.value = null
      cache.set(key, { data: result, timestamp: Date.now() })
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
      isValidating.value = false
    }
  }

  // Initial load
  const load = async () => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < DEDUPING_INTERVAL) {
      data.value = cached.data
      return
    }
    await mutate()
  }

  // Revalidate on focus
  const handleFocus = () => {
    if (revalidateOnFocus && document.visibilityState === 'visible') {
      mutate()
    }
  }

  // Revalidate on reconnect
  const handleOnline = () => {
    if (revalidateOnReconnect) {
      mutate()
    }
  }

  // Setup refresh interval
  const setupRefreshInterval = () => {
    if (refreshInterval && refreshInterval > 0) {
      refreshTimer = window.setInterval(() => {
        mutate()
      }, refreshInterval)
    }
  }

  // Cleanup refresh interval
  const cleanupRefreshInterval = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  onMounted(() => {
    isMounted = true
    load()
    
    if (revalidateOnFocus) {
      document.addEventListener('visibilitychange', handleFocus)
    }
    
    if (revalidateOnReconnect) {
      window.addEventListener('online', handleOnline)
    }

    setupRefreshInterval()
  })

  onUnmounted(() => {
    isMounted = false
    cleanupRefreshInterval()
    
    if (revalidateOnFocus) {
      document.removeEventListener('visibilitychange', handleFocus)
    }
    
    if (revalidateOnReconnect) {
      window.removeEventListener('online', handleOnline)
    }
  })

  // Revalidate when key changes
  watch(() => key, () => {
    if (isMounted) {
      load()
    }
  })

  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    isLoading: computed(() => isLoading.value),
    isValidating: computed(() => isValidating.value),
    mutate
  }
}

// Helper for SSR compatibility
export const useSWRV = <T>(key: string, fetcher: () => Promise<T>) => {
  return useDataLoader<T>({
    key,
    fetcher,
    revalidateOnFocus: false
  })
}
