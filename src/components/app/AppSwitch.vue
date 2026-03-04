<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}>(), {
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
}>();

const toggle = () => {
  if (props.disabled) return;
  const next = !props.modelValue;
  emit('update:modelValue', next);
  emit('change', next);
};
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="toggle"
    :class="cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
      disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      modelValue ? 'bg-primary' : 'bg-border'
    )"
  >
    <span
      :class="cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
        modelValue ? 'translate-x-5' : 'translate-x-1'
      )"
    />
  </button>
</template>
