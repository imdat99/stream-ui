<script setup lang="ts">
import { computed, inject } from 'vue';

interface FieldProps {
  name: string;
  label?: string;
}

const props = defineProps<FieldProps>();

const formContext = inject<{
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  validators: Record<string, ((value: any) => string | undefined)[]>;
  handleBlur: (name: string) => void;
  handleChange: (name: string, value: any) => void;
} | null>('form-context', null);

const error = computed(() => props.name ? formContext?.errors[props.name] : undefined);
const isInvalid = computed(() => props.name ? formContext?.touched[props.name] && !!error.value : false);
const fieldValue = computed(() => props.name ? formContext?.values[props.name] ?? '' : '');

const onChange = (value: any) => {
  if (props.name && formContext) {
    formContext.handleChange(props.name, value);
  }
};

const onBlur = () => {
  if (props.name && formContext) {
    formContext.handleBlur(props.name);
  }
};

// Provide values to slot
const slotProps = {
  value: fieldValue,
  error: error,
  errorMessage: error,
  isInvalid,
  name: props.name,
  onChange,
  onBlur,
};
</script>

<template>
  <div class="field flex flex-col gap-1">
    <label v-if="label" :for="name" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <slot v-bind="slotProps" />
    <div v-if="isInvalid && error" class="text-xs text-red-600 mt-1">
      {{ error }}
    </div>
  </div>
</template>
