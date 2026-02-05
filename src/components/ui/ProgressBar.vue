<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: number
  showValue?: boolean
  unit?: string
  mode?: 'determinate' | 'indeterminate'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  showValue: true,
  unit: '%',
  mode: 'determinate',
  color: 'primary'
})

const normalizedValue = computed(() => {
  return Math.max(0, Math.min(100, props.value))
})

const colorClasses = {
  primary: 'bg-blue-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500'
}
</script>

<template>
  <div :class="['w-full', props.class]">
    <div class="flex items-center gap-2">
      <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          v-if="mode === 'determinate'"
          :class="['h-full rounded-full transition-all duration-300 ease-out', colorClasses[color]]"
          :style="{ width: `${normalizedValue}%` }"
        />
        <div
          v-else
          :class="['h-full rounded-full animate-pulse', colorClasses[color]]"
          style="width: 50%"
        />
      </div>
      <span v-if="showValue && mode === 'determinate'" class="text-xs font-medium text-gray-600 min-w-[3rem] text-right">
        {{ normalizedValue }}{{ unit }}
      </span>
    </div>
  </div>
</template>
