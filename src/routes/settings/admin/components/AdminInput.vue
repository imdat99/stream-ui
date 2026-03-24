<script setup lang="ts">
import AppInput from '@/components/ui/AppInput.vue';

defineProps<{
  modelValue?: string | number | null;
  type?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  autocomplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxlength?: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'enter'): void;
}>();
</script>

<template>
  <AppInput
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    :id="id"
    :name="name"
    :autocomplete="autocomplete"
    :min="min"
    :max="max"
    :step="step"
    :maxlength="maxlength"
    inputClass="bg-white py-1.5 text-sm text-foreground placeholder:text-foreground/45 focus:border-primary/40 focus:ring-primary/15"
    @update:model-value="emit('update:modelValue', $event)"
    @enter="emit('enter')"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
  </AppInput>
</template>
