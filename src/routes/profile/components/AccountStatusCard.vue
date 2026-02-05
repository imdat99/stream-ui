<script setup lang="ts">
import ProgressBar from '@/components/ui/ProgressBar.vue';
import { computed } from 'vue';

interface Props {
  storageUsed?: number
  storageTotal?: number
}

const props = withDefaults(defineProps<Props>(), {
  storageUsed: 0,
  storageTotal: 100
})

const usagePercentage = computed(() => {
  if (props.storageTotal === 0) return 0
  return Math.round((props.storageUsed / props.storageTotal) * 100)
})
</script>

<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-600">Storage Usage</span>
          <span class="font-medium text-gray-900">{{ usagePercentage }}%</span>
        </div>
        <ProgressBar :value="usagePercentage" :show-value="false" />
        <p class="text-xs text-gray-500 mt-2">
          {{ storageUsed }} GB of {{ storageTotal }} GB used
        </p>
      </div>
    </div>
  </div>
</template>
