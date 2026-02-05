<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden" :class="props.class">
    <!-- Header slot -->
    <div v-if="$slots.header" class="border-b border-gray-100">
      <slot name="header" />
    </div>

    <!-- Content -->
    <div>
      <slot name="content">
        <slot />
      </slot>
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>
