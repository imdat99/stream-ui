<script setup lang="ts">
import { ProgressBar } from '@/components/ui/form';
import { formatBytes } from '@/lib/utils';
import { computed } from 'vue';

const props = defineProps<{
    storageUsed: number;
    storageLimit: number;
    uploadsUsed: number;
    uploadsLimit: number;
}>();

const storagePercentage = computed(() => Math.min(Math.round((props.storageUsed / props.storageLimit) * 100), 100));
const uploadsPercentage = computed(() => Math.min(Math.round((props.uploadsUsed / props.uploadsLimit) * 100), 100));
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col justify-center">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Usage Statistics</h3>
        
        <div class="mb-6">
            <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600 font-medium">Storage</span>
                <span class="text-gray-900 font-bold">{{ storagePercentage }}%</span>
            </div>
            <ProgressBar :value="storagePercentage" />
            <p class="text-xs text-gray-500 mt-2">{{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used</p>
        </div>

        <div>
            <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600 font-medium">Monthly Uploads</span>
                <span class="text-gray-900 font-bold">{{ uploadsPercentage }}%</span>
            </div>
            <ProgressBar :value="uploadsPercentage" />
            <p class="text-xs text-gray-500 mt-2">{{ uploadsUsed }} of {{ uploadsLimit }} uploads</p>
        </div>
    </div>
</template>
