<script setup lang="ts">
import { provide, reactive } from 'vue';

const props = defineProps<{
  initialValues?: Record<string, any>;
  validators?: Record<string, ((value: any) => string | undefined)[]>;
  formClass?: string;
}>();

const emit = defineEmits<{
  submit: [values: Record<string, any>];
}>();

const errors = reactive<Record<string, string>>({});
const touched = reactive<Record<string, boolean>>({});
const values = reactive<Record<string, any>>({...props.initialValues});

// Initialize values
if (props.initialValues) {
  Object.assign(values, props.initialValues);
}

const validateField = (name: string) => {
  const value = values[name];
  const fieldValidators = props.validators?.[name] || [];
  
  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) {
      errors[name] = error;
      return false;
    }
  }
  delete errors[name];
  return true;
};

const validateAll = () => {
  const fieldNames = Object.keys(props.validators || {});
  let isValid = true;
  
  for (const name of fieldNames) {
    if (!validateField(name)) {
      isValid = false;
    }
  }
  
  return isValid;
};

const handleSubmit = () => {
  // Mark all fields as touched
  const fieldNames = Object.keys(props.validators || {});
  for (const name of fieldNames) {
    touched[name] = true;
  }
  
  if (validateAll()) {
    emit('submit', {...values});
  }
};

const handleBlur = (name: string) => {
  touched[name] = true;
  validateField(name);
};

const handleChange = (name: string, value: any) => {
  values[name] = value;
  if (touched[name]) {
    validateField(name);
  }
};

// Provide form context to child components
provide('form-context', {
  values,
  errors,
  touched,
  validators: props.validators || {},
  handleBlur,
  handleChange,
  validateField,
});
</script>

<template>
  <form @submit.prevent="handleSubmit" :class="[formClass, 'flex flex-col gap-4 w-full']">
    <slot />
  </form>
</template>
