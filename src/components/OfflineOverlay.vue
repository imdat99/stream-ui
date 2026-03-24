<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import { useTranslation } from 'i18next-vue'
import { onBeforeUnmount, onMounted } from 'vue'

const { t } = useTranslation()
const { isOffline, startListening, stopListening } = useNetworkStatus()

onMounted(() => {
  startListening()
})

onBeforeUnmount(() => {
  stopListening()
})

function reloadPage() {
  if (typeof window === 'undefined') return

  window.location.reload()
}
</script>

<template>
  <div
    v-if="isOffline"
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 px-6 backdrop-blur-sm"
    role="alert"
    aria-live="assertive"
  >
    <div class="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-2xl">
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <svg
          class="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="M5 12.86a10 10 0 0 1 14 0" />
          <path d="M8.5 16.43a5 5 0 0 1 7 0" />
          <path d="M12 20h.01" />
          <path d="M3 3l18 18" />
        </svg>
      </div>

      <h2 class="text-xl font-semibold text-foreground">
        {{ t('network.offline.title') }}
      </h2>

      <p class="mt-3 text-sm leading-6 text-foreground/70">
        {{ t('network.offline.description') }}
      </p>

      <div class="mt-6 flex justify-center">
        <AppButton @click="reloadPage">
          {{ t('network.offline.action') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
