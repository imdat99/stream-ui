<script setup lang="ts">
import { useRouteLoading } from '@/composables/useRouteLoading';
import { computed } from 'vue';

const { visible, progress } = useRouteLoading()

const barStyle = computed(() => ({
  transform: `scaleX(${progress.value / 100})`,
  opacity: visible.value ? '1' : '0',
}))
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.75"
    aria-hidden="true"
  >
    <div
      class="h-full origin-left rounded-r-full bg-primary/50 transition-[transform,opacity] duration-200 ease-out"
      :style="barStyle"
    />
  </div>
</template>
