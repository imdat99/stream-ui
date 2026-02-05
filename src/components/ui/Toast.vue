<script setup lang="ts">
import { useToast, type ToastSeverity } from '@/composables/useToast'

const toast = useToast()

const severityIcons: Record<ToastSeverity, string> = {
  success: 'i-heroicons-check-circle',
  error: 'i-heroicons-x-circle',
  info: 'i-heroicons-information-circle',
  warn: 'i-heroicons-exclamation-triangle'
}

const severityClasses: Record<ToastSeverity, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warn: 'bg-yellow-50 border-yellow-200 text-yellow-800'
}

const severityIconColors: Record<ToastSeverity, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warn: 'text-yellow-500'
}

const handleClose = (id: string) => {
  toast.remove(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup
        enter-active-class="transition ease-out duration-300"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="message in toast.messages"
          :key="message.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px]',
            severityClasses[message.severity]
          ]"
        >
          <span
            :class="[
              severityIcons[message.severity],
              severityIconColors[message.severity],
              'w-5 h-5 flex-shrink-0 mt-0.5'
            ]"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm">{{ message.summary }}</p>
            <p v-if="message.detail" class="text-sm opacity-90 mt-0.5">{{ message.detail }}</p>
          </div>
          <button
            type="button"
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            @click="handleClose(message.id)"
          >
            <span class="i-heroicons-x-mark w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
