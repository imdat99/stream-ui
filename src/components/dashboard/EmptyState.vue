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
      class="btn btn-outline-primary press-animated flex items-center gap-2"
    >
       <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
       </svg>
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
