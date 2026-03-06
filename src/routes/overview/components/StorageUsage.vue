<script setup lang="ts">
import { formatBytes } from '@/lib/utils';
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

interface Props {
    loading: boolean;
    stats: {
        totalVideos: number;
        storageUsed: number;
        storageLimit: number;
    }
}

const props = defineProps<Props>();
const { t } = useTranslation();

const storagePercentage = computed(() => {
    return Math.round((props.stats.storageUsed / props.stats.storageLimit) * 100);
});

const storageBreakdown = computed(() => {
    const videoSize = props.stats.storageUsed;
    const thumbSize = props.stats.totalVideos * 300 * 1024; // ~300KB per thumbnail
    const otherSize = props.stats.totalVideos * 100 * 1024; // ~100KB other files
    const total = videoSize + thumbSize + otherSize;

    return [
        { label: t('overview.storage.breakdown.videos'), size: videoSize, percentage: (videoSize / (total || 1)) * 100, color: 'bg-primary' },
        { label: t('overview.storage.breakdown.thumbnails'), size: thumbSize, percentage: (thumbSize / (total || 1)) * 100, color: 'bg-blue-500' },
        { label: t('overview.storage.breakdown.other'), size: otherSize, percentage: (otherSize / (total || 1)) * 100, color: 'bg-gray-400' },
    ];
});
</script>

<template>
    <div v-if="!loading" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">{{ t('overview.storage.title') }}</h2>

        <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                    {{ t('overview.storage.usedOfLimit', { used: formatBytes(stats.storageUsed), limit: formatBytes(stats.storageLimit) }) }}
                </span>
                <span class="text-sm font-medium" :class="storagePercentage > 80 ? 'text-danger' : 'text-gray-700'">
                    {{ storagePercentage }}%
                </span>
            </div>

            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-500 rounded-full"
                    :class="storagePercentage > 80 ? 'bg-danger' : 'bg-primary'"
                    :style="{ width: `${storagePercentage}%` }" />
            </div>
        </div>

        <div class="space-y-2">
            <div v-for="item in storageBreakdown" :key="item.label" class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                    <div :class="['w-3 h-3 rounded-sm', item.color]" />
                    <span class="text-gray-700">{{ item.label }}</span>
                </div>
                <span class="text-gray-500">{{ formatBytes(item.size) }}</span>
            </div>
        </div>

        <div v-if="storagePercentage > 80" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex gap-2">
                <span class="i-heroicons-exclamation-triangle w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p class="text-sm font-medium text-yellow-800">{{ t('overview.storage.lowStorage.title') }}</p>
                    <p class="text-sm text-yellow-700 mt-1">
                        {{ t('overview.storage.lowStorage.message') }}
                        <router-link to="/plans" class="underline font-medium">{{ t('overview.storage.lowStorage.viewPlans') }}</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
