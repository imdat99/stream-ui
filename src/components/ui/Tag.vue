<script setup lang="ts">
interface Props {
  value?: string
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
  icon?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'primary'
})

const severityClasses = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      severityClasses[severity],
      props.class
    ]"
  >
    <span v-if="icon" :class="[icon, 'w-3 h-3']" />
    <slot>{{ value }}</slot>
  </span>
</template>
