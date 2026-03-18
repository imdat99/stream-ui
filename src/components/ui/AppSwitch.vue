<script setup lang="ts">
import { cn } from '@/lib/utils';

interface SwitchProps {
  disabled?: boolean;
  ariaLabel?: string;
  class?: string; // Đổi từ className sang class cho chuẩn Vue
}

const props = withDefaults(defineProps<SwitchProps>(), {
  disabled: false,
});

// Vue 3.4+ - Quản lý v-model cực gọn
const modelValue = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  (e: 'change', value: boolean): void;
}>();

const toggle = () => {
  if (props.disabled) return;
  modelValue.value = !modelValue.value;
  emit('change', modelValue.value);
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
      // Layout & Size
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200',
      // Focus states (UnoCSS style)
      'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      // Status states
      disabled ? 'op-50 cursor-not-allowed' : 'cursor-pointer',
      modelValue ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-300',
      props.class
    )"
  >
    <span
      :class="cn(
        // Toggle thumb
        'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      )"
    />
  </button>
</template>