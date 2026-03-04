<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  class?: string;
}>();

const pct = computed(() => {
  const v = Number(props.value);
  if (Number.isNaN(v)) return 0;
  return Math.min(Math.max(v, 0), 100);
});
</script>

<template>
  <div :class="cn('w-full bg-muted/50 rounded-full overflow-hidden', props.class)" style="height: 6px">
    <div class="bg-primary h-full rounded-full transition-all duration-300" :style="{ width: `${pct}%` }" />
  </div>
</template>
