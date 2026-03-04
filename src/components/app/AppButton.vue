<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const props = withDefaults(defineProps<{
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
});

const baseClass = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all press-animated select-none';

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm';
    case 'md':
    default:
      return 'px-4 py-2 text-sm';
  }
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-muted/50 text-foreground hover:bg-muted border border-border';
    case 'danger':
      return 'bg-danger text-white hover:bg-danger/90';
    case 'ghost':
      return 'bg-transparent text-foreground/70 hover:text-foreground hover:bg-muted/50';
    case 'primary':
    default:
      return 'bg-primary text-white hover:bg-primary/90';
  }
});

const disabledClass = computed(() => (props.disabled || props.loading) ? 'opacity-60 cursor-not-allowed' : '');
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="cn(baseClass, sizeClass, variantClass, disabledClass)"
  >
    <span v-if="loading" class="inline-flex items-center" aria-hidden="true">
      <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
    </span>
    <slot name="icon" />
    <slot />
  </button>
</template>
