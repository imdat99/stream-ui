<script setup lang="ts" generic="T">
import { useForm } from '@tanstack/vue-form';
import { provide } from 'vue';

interface FormProps {
  initialValues?: T;
  onSubmit?: (values: T) => void | Promise<void>;
  validators?: Record<string, (value: any) => string | undefined>;
}

const props = defineProps<FormProps>();

const form = useForm({
  initialValues: props.initialValues,
  onSubmit: async (values) => {
    await props.onSubmit?.(values.value);
  },
});

// Provide form context to child components
provide('tanstack-form', form);
provide('tanstack-form-validators', props.validators || {});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  form.handleSubmit();
};
</script>

<template>
  <form @submit="handleSubmit" class="flex flex-col gap-4 w-full">
    <slot :form="form" />
  </form>
</template>
