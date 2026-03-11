<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = withDefaults(defineProps<{
  actionClass?: string;
  titleClass?: string;
  descriptionClass?: string;
}>(), {
  actionClass: 'h-6 w-11',
  titleClass: 'w-32',
  descriptionClass: 'w-56 max-w-full',
});
</script>

<template>
  <div class="flex items-center justify-between gap-4 px-6 py-4 animate-pulse">
    <div class="flex min-w-0 items-center gap-4">
      <div class="h-10 w-10 rounded-md bg-muted/50 shrink-0" />

      <div class="min-w-0 space-y-2">
        <div :class="cn('h-4 rounded bg-muted/50', titleClass)" />
        <div :class="cn('h-3 rounded bg-muted/40', descriptionClass)" />
      </div>
    </div>

    <div :class="cn('shrink-0 rounded-full bg-muted/50', actionClass)" />
  </div>
</template>
