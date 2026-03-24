<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
}>(), {
  hint: '',
  tone: 'accent',
});

const dotClass = computed(() => {
  const tones = {
    accent: 'bg-primary text-primary',
    success: 'bg-emerald-500 text-emerald-500',
    warning: 'bg-amber-500 text-amber-500',
    danger: 'bg-rose-500 text-rose-500',
    neutral: 'bg-slate-400 text-slate-400',
  } as const;

  return tones[props.tone];
});
</script>

<template>
  <article class="overflow-hidden rounded-lg border border-border bg-background px-4 py-3.5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-foreground/55">
          {{ label }}
        </p>
        <div class="mt-2 break-words text-[28px] leading-8 font-semibold text-foreground">
          {{ value }}
        </div>
        <p v-if="hint" class="mt-2 text-xs leading-5 text-foreground/60">
          {{ hint }}
        </p>
      </div>

      <span :class="cn('mt-1 inline-flex h-2 w-2 shrink-0 rounded-full border border-current/20', dotClass)" />
    </div>
  </article>
</template>
