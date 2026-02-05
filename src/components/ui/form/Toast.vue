<script setup lang="ts">
import { provide, ref } from 'vue';

interface ToastItem {
  id: string;
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail?: string;
  life?: number;
}

const toasts = ref<ToastItem[]>([]);

const addToast = (toast: Omit<ToastItem, 'id'>) => {
  const id = crypto.randomUUID();
  const newToast = { ...toast, id };
  toasts.value.push(newToast);
  
  const life = toast.life || 5000;
  setTimeout(() => {
    removeToast(id);
  }, life);
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const toast = {
  add: addToast,
  remove: removeToast,
};

provide('toast', toast);

const severityClasses = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warn: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

const severityIcons = {
  success: '✓',
  error: '✕',
  warn: '⚠',
  info: 'ℹ',
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
            severityClasses[toast.severity],
          ]"
        >
          <span class="text-lg">{{ severityIcons[toast.severity] }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium">{{ toast.summary }}</p>
            <p v-if="toast.detail" class="text-sm opacity-90 mt-1">{{ toast.detail }}</p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="p-1 hover:bg-black/5 rounded transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
