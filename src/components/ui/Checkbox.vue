<script setup lang="ts">
interface Props {
  modelValue: any[] | boolean | undefined
  value?: any
  name?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  binary?: boolean
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  binary: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any[] | boolean]
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5'
}

const isChecked = (): boolean => {
  if (props.binary) {
    return !!(props.modelValue as boolean)
  }
  return Array.isArray(props.modelValue) && props.value !== undefined
    ? props.modelValue.includes(props.value)
    : false
}

const toggle = (event?: MouseEvent) => {
  if (props.binary) {
    emit('update:modelValue', !props.modelValue)
  } else {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
    if (props.value !== undefined) {
      if (currentValue.includes(props.value)) {
        emit('update:modelValue', currentValue.filter(v => v !== props.value))
      } else {
        emit('update:modelValue', [...currentValue, props.value])
      }
    }
  }
  if (event) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    class="inline-flex items-center"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
    @click="!disabled && toggle($event)"
  >
    <div
      :class="[
        sizeClasses[size],
        'rounded border-2 flex items-center justify-center transition-colors',
        isChecked()
          ? 'bg-blue-600 border-blue-600'
          : 'bg-white border-gray-300 hover:border-gray-400'
      ]"
    >
      <span
        v-if="isChecked()"
        class="i-heroicons-check text-white"
        :class="size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'"
      />
    </div>
    <input
      type="checkbox"
      :name="name"
      :id="inputId"
      :checked="isChecked()"
      :disabled="disabled"
      class="sr-only"
      @change="toggle()"
    />
  </div>
</template>
