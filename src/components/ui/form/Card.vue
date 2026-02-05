<script setup lang="ts">
interface CardProps {
  cardClass?: string;
}

defineProps<CardProps>();
</script>

<template>
  <div :class="['bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden', cardClass]">
    <slot name="header" />
    <div>
      <slot />
    </div>
  </div>
</template>
