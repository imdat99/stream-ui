<script setup lang="ts">
import StatsCard from '@/components/dashboard/StatsCard.vue';
import { formatBytes } from '@/lib/utils';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';

interface Props {
    loading: boolean;
    stats: {
        totalVideos: number;
        totalViews: number;
        storageUsed: number;
        storageLimit: number;
    };
}

const props = defineProps<Props>();
const { t, i18next } = useTranslation();
const localeTag = computed(() => i18next.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US');
</script>

<template>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="i in 3" :key="i" class="bg-header rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="space-y-2">
                    <div class="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div class="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div class="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard :title="t('overview.stats.totalVideos')" :value="stats.totalVideos" :trend="{ value: 12, isPositive: true }" />

        <StatsCard :title="t('overview.stats.totalViews')" :value="stats.totalViews.toLocaleString(localeTag)"
            :trend="{ value: 8, isPositive: true }" />

        <StatsCard :title="t('overview.stats.storageUsed')"
            :value="`${formatBytes(stats.storageUsed)} / ${formatBytes(stats.storageLimit)}`" color="warning" />
    </div>
</template>
