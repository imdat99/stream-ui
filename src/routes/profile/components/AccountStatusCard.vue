<script setup lang="ts">
import { ProgressBar } from '@/components/ui/form';
import { computed } from 'vue';

const props = defineProps<{
    storageUsed: number;
    storageLimit: number;
}>();

const storagePercentage = computed(() => 
    Math.min(Math.round((props.storageUsed / props.storageLimit) * 100), 100)
);

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
        <div class="space-y-4">
            <div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Storage Used</span>
                    <span class="font-bold text-gray-900">{{ storagePercentage }}%</span>
                </div>
                <ProgressBar :value="storagePercentage" />
                <p class="text-xs text-gray-500 mt-2">{{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4 border border-green-100 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div>
                    <h4 class="font-bold text-green-800 text-sm">Account Active</h4>
                    <p class="text-green-600 text-xs mt-0.5">Your subscription is in good standing.</p>
                </div>
            </div>
        </div>
    </div>
</template>
