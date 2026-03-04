<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed } from 'vue';

// Vue macro is available at compile time; provide a safe fallback for typecheck.
declare const defineModelModifiers: undefined | (<T>() => T);


type Props = {
  modelValue?: string | number | null;
  type?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  autocomplete?: string;
  inputClass?: string;
  wrapperClass?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxlength?: number;
};

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  readonly: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
  (e: 'enter'): void;
}>();

const modelModifiers = (typeof defineModelModifiers === 'function'
  ? defineModelModifiers<{ number?: boolean }>()
  : ({} as { number?: boolean }));

const isNumberLike = computed(() => props.type === 'number' || !!modelModifiers.number);

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  const raw = el.value;
  if (isNumberLike.value) {
    if (raw === '') {
      emit('update:modelValue', null);
      return;
    }
    const n = Number(raw);
    emit('update:modelValue', Number.isNaN(n) ? null : n);
    return;
  }
  emit('update:modelValue', raw);
};

const onKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') emit('enter');
};

const baseInputClass = 'w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed';
</script>

<template>
  <div :class="cn('relative', wrapperClass)">
    <div v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
      <slot name="prefix" />
    </div>

    <input
      :id="id"
      :name="name"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :step="step"
      :maxlength="maxlength"
      :class="cn(baseInputClass, $slots.prefix ? 'pl-10' : '', inputClass)"
      @input="onInput"
      @keyup="onKeyup"
    />
  </div>
</template>
