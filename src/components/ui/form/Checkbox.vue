<script setup lang="ts">
import { computed, inject } from 'vue';

interface CheckboxProps {
  name: string;
  value?: any;
  binary?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  binary: false,
  disabled: false,
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
  get: () => {
    const val = formContext?.values[props.name];
    if (props.binary) return !!val;
    return val?.includes(props.value);
  },
  set: (val) => {
    if (props.binary) {
      formContext?.handleChange(props.name, val);
    } else {
      const current = formContext?.values[props.name] || [];
      if (val) {
        formContext?.handleChange(props.name, [...current, props.value]);
      } else {
        formContext?.handleChange(props.name, current.filter((v: any) => v !== props.value));
      }
    }
  },
});
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      :id="name + '-' + (value ?? 'binary')"
      type="checkbox"
      v-model="modelValue"
      :disabled="disabled"
      :class="[
        'w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isInvalid ? 'border-red-500' : '',
      ]"
      @blur="formContext?.handleBlur(name)"
    />
    <label v-if="$slots.default" :for="name + '-' + (value ?? 'binary')" class="text-sm text-gray-700">
      <slot />
    </label>
  </div>
</template>
