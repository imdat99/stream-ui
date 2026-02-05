<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  borderRadius?: string
  circle?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  borderRadius: '0.375rem',
  circle: false
})
</script>

<template>
  <div
    :class="['animate-pulse bg-gray-200', props.class]"
    :style="{
      width,
      height,
      borderRadius: circle ? '50%' : borderRadius
    }"
  />
</template>
