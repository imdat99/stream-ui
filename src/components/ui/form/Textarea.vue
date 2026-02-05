<script setup lang="ts">
import { computed, inject } from 'vue';

interface TextareaProps {
  name: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  fluid?: boolean;
}

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  disabled: false,
  fluid: true,
});

const formContext = inject<{
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleBlur: (name: string) => void;
  handleChange: (name: string, value: any) => void;
} | null>('form-context', null);

const error = computed(() => formContext?.errors[props.name]);
const isInvalid = computed(() => formContext?.touched[props.name] && error.value);
const modelValue = computed({
  get: () => formContext?.values[props.name] ?? '',
  set: (val) => formContext?.handleChange(props.name, val),
});
</script>

<template>
  <textarea
    :id="name"
    v-model="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="[
      'px-3 py-2 text-sm border rounded-lg outline-none transition-colors resize-none',
      'focus:ring-2 focus:ring-primary/20 focus:border-primary',
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
      fluid ? 'w-full' : '',
      isInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300',
    ]"
    @blur="formContext?.handleBlur(name)"
  />
</template>
