<script setup lang="ts">
interface TagProps {
  value?: string;
  severity?: 'success' | 'error' | 'warn' | 'info' | 'secondary';
  rounded?: boolean;
}

const props = withDefaults(defineProps<TagProps>(), {
  rounded: true,
});

const severityClasses = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warn: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 text-xs font-medium',
      rounded ? 'rounded-full' : 'rounded',
      severity ? severityClasses[severity] : 'bg-gray-100 text-gray-800',
    ]"
  >
    <slot>{{ value }}</slot>
  </span>
</template>
