<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
}>(), {
  modelValue: '',
  rows: 3,
  placeholder: '',
  disabled: false,
  class: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};
</script>

<template>
  <textarea
    :value="props.modelValue ?? ''"
    :rows="props.rows"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="cn('w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground/45 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60', props.class)"
    @input="onInput"
  />
</template>
