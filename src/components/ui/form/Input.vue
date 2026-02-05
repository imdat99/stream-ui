<script setup lang="ts">
import { computed } from 'vue';

interface InputProps {
  name?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  fluid?: boolean;
  modelValue?: string | any;
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false,
  fluid: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Handle the v-model binding - support both string and computed ref
const inputValue = computed(() => {
  const val = props.modelValue;
  // Check if it's a ref/computed
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val ?? '';
});

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <input
    :id="name"
    :value="inputValue"
    @input="onInput"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="[
      'px-3 py-2 text-sm border rounded-lg outline-none transition-colors',
      'focus:ring-2 focus:ring-primary/20 focus:border-primary',
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
      fluid ? 'w-full' : '',
      'border-gray-300',
    ]"
  />
</template>
