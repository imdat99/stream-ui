<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  fluid?: boolean
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  feedback?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  fluid: false,
  size: 'md',
  invalid: false,
  feedback: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const showPassword = ref(false)

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const inputClasses = computed(() => [
  'block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-100 disabled:cursor-not-allowed pr-10',
  props.invalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
  sizeClasses[props.size]
])

const passwordStrength = computed(() => {
  if (!props.modelValue) return 0
  let strength = 0
  if (props.modelValue.length >= 8) strength++
  if (/[A-Z]/.test(props.modelValue)) strength++
  if (/[0-9]/.test(props.modelValue)) strength++
  if (/[^A-Za-z0-9]/.test(props.modelValue)) strength++
  return strength
})

const strengthText = computed(() => {
  const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  return texts[passwordStrength.value]
})

const strengthColor = computed(() => {
  const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  return colors[passwordStrength.value]
})
</script>

<template>
  <div :class="[fluid ? 'w-full' : '', props.class]">
    <div class="relative">
      <input
        :name="name"
        :type="showPassword ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        @click="showPassword = !showPassword"
      >
        <span
          :class="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
          class="w-5 h-5"
        />
      </button>
    </div>
    
    <div v-if="feedback && modelValue" class="mt-2">
      <div class="flex gap-1 h-1 mb-1">
        <div
          v-for="i in 4"
          :key="i"
          class="flex-1 rounded-full transition-colors"
          :class="i <= passwordStrength ? strengthColor : 'bg-gray-200'"
        />
      </div>
      <p class="text-xs text-gray-500">{{ strengthText }}</p>
    </div>
  </div>
</template>
