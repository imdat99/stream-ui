<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  name?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  fluid?: boolean
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  class?: string | Record<string, boolean>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  fluid: false,
  size: 'md',
  invalid: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
}>()

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const baseClasses = computed(() => [
  'block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-100 disabled:cursor-not-allowed',
  props.invalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
  sizeClasses[props.size]
])

const inputClasses = computed(() => {
  if (typeof props.class === 'string') {
    return twMerge(baseClasses.value.join(' '), props.class)
  }
  return twMerge(baseClasses.value.join(' '))
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' 
    ? (target.valueAsNumber || 0) 
    : target.value
  emit('update:modelValue', value)
  emit('input', event)
}
</script>

<template>
  <input
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="inputClasses"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>
