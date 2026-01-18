<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  imageUrl?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="empty-state flex flex-col items-center justify-center py-12 px-6 text-center">
    <!-- Icon or Image -->
    <div v-if="imageUrl" class="mb-6">
      <img :src="imageUrl" :alt="title" class="w-64 h-64 object-contain opacity-80" />
    </div>
    <div 
      v-else-if="icon"
      class="mb-6 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center"
    >
      <span :class="[icon, 'w-12 h-12 text-gray-400']" />
    </div>
    <div v-else class="mb-6 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
      <span class="i-heroicons-inbox w-12 h-12 text-gray-400" />
    </div>

    <!-- Content -->
    <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-gray-600 mb-6 max-w-md">{{ description }}</p>

    <!-- Action Button -->
    <button
      v-if="actionLabel && onAction"
      @click="onAction"
      class="px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors press-animated flex items-center gap-2"
    >
      <span class="i-heroicons-plus w-5 h-5" />
      {{ actionLabel }}
    </button>

    <!-- Slot for custom actions -->
    <slot name="actions" />
  </div>
</template>

<style scoped>
.empty-state {
  min-height: 400px;
}
</style>
