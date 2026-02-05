<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  image?: string
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle'
})

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

const initials = computed(() => {
  if (!props.label) return ''
  return props.label
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const bgColor = computed(() => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500'
  ]
  if (!props.label) return 'bg-gray-400'
  let hash = 0
  for (let i = 0; i < props.label.length; i++) {
    hash = props.label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})
</script>

<template>
  <div
    :class="[
      'inline-flex items-center justify-center overflow-hidden font-medium text-white',
      sizeClasses[size],
      shape === 'circle' ? 'rounded-full' : 'rounded-lg',
      !image ? bgColor : '',
      props.class
    ]"
  >
    <img
      v-if="image"
      :src="image"
      :alt="label || 'Avatar'"
      class="w-full h-full object-cover"
    />
    <span v-else-if="initials">{{ initials }}</span>
    <span v-else class="i-heroicons-user w-1/2 h-1/2" />
  </div>
</template>
