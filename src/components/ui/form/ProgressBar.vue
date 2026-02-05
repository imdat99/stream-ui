<script setup lang="ts">
interface ProgressBarProps {
  value?: number;
  showValue?: boolean;
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  value: 0,
  showValue: false,
});
</script>

<template>
  <div class="w-full">
    <div
      v-if="showValue"
      class="flex justify-between mb-1"
    >
      <span class="text-sm font-medium text-gray-700">
        <slot name="value">{{ Math.round(value) }}%</slot>
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        class="bg-primary h-2 rounded-full transition-all duration-300"
        :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
      />
    </div>
  </div>
</template>
