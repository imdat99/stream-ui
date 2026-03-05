<script setup lang="ts">
import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import XCircleIcon from '@/components/icons/XCircleIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';
import { cn } from '@/lib/utils';
import { onBeforeUnmount, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppToast, type AppToastSeverity } from '@/composables/useAppToast';

const { toasts, remove } = useAppToast();
const { t } = useI18n();

const timers = new Map<string, ReturnType<typeof setTimeout>>();

const dismiss = (id: string) => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  remove(id);
};

const iconFor = (severity: AppToastSeverity) => {
  switch (severity) {
    case 'success':
      return CheckCircleIcon;
    case 'warn':
      return AlertTriangleIcon;
    case 'error':
      return XCircleIcon;
    case 'info':
    default:
      return InfoIcon;
  }
};

const toneClass = (severity: AppToastSeverity) => {
  switch (severity) {
    case 'success':
      return 'border-success/25 bg-success/5';
    case 'warn':
      return 'border-warning/25 bg-warning/5';
    case 'error':
      return 'border-danger/25 bg-danger/5';
    case 'info':
    default:
      return 'border-info/25 bg-info/5';
  }
};

watchEffect(() => {
  if (typeof window === 'undefined') return;
  for (const t of toasts.value) {
    if (timers.has(t.id)) continue;
    const life = Math.max(0, t.life ?? 3000);
    const timer = setTimeout(() => {
      dismiss(t.id);
    }, life);
    timers.set(t.id, timer);
  }
});

onBeforeUnmount(() => {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
});
</script>

<template>
  <div class="fixed top-4 right-4 z-[10000] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
    <TransitionGroup
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="cn('flex items-start gap-3 p-3 rounded-lg border shadow-sm', toneClass(t.severity))"
      >
        <component :is="iconFor(t.severity)" class="w-5 h-5 mt-0.5" :class="t.severity === 'success' ? 'text-success' : t.severity === 'warn' ? 'text-warning' : t.severity === 'error' ? 'text-danger' : 'text-info'" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-foreground truncate">{{ t.summary }}</p>
          <p v-if="t.detail" class="text-xs text-foreground/70 mt-0.5 break-words">{{ t.detail }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-md text-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all"
          @click="dismiss(t.id)"
          :aria-label="t('toast.dismissAria')"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
