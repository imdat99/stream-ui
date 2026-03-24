<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  modelValue?: string | number | null;
  disabled?: boolean;
  id?: string;
  name?: string;
  class?: string;
}>(), {
  modelValue: '',
  disabled: false,
  id: undefined,
  name: undefined,
  class: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
};
</script>

<template>
  <select
    :id="props.id"
    :name="props.name"
    :value="props.modelValue ?? ''"
    :disabled="props.disabled"
    :class="cn('w-full rounded-md border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60', props.class)"
    @change="onChange"
  >
    <slot />
  </select>
</template>
