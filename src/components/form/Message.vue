<script setup lang="ts">
interface Props {
  severity?: 'error' | 'success' | 'info' | 'warn'
  size?: 'sm' | 'md'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'error',
  size: 'sm'
})

const severityClasses = {
  error: 'text-red-600',
  success: 'text-green-600',
  info: 'text-blue-600',
  warn: 'text-yellow-600'
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm'
}
</script>

<template>
  <span
    :class="[
      severityClasses[severity],
      sizeClasses[size],
      props.class
    ]"
  >
    <slot />
  </span>
</template>
