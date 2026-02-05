<script setup lang="ts">
interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  width: '100%',
  height: '1rem',
  borderRadius: '0.375rem',
});
</script>

<template>
  <div
    class="animate-pulse bg-gray-200"
    :style="{
      width,
      height,
      borderRadius,
    }"
  />
</template>
