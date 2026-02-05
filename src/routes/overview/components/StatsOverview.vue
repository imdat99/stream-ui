<script setup lang="ts">
import StatsCard from '@/components/dashboard/StatsCard.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { formatBytes } from '@/lib/utils';

interface Props {
    loading: boolean;
    stats: {
        totalVideos: number;
        totalViews: number;
        storageUsed: number;
        storageLimit: number;
        uploadsThisMonth: number;
    };
}

defineProps<Props>();
</script>

<template>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-surface rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="space-y-2">
                    <Skeleton width="5rem" height="1rem" class="mb-2"></Skeleton>
                    <Skeleton width="8rem" height="2rem"></Skeleton>
                </div>
                <!-- <Skeleton circle width="3rem" height="3rem"></Skeleton> -->
            </div>
            <Skeleton width="4rem" height="1rem"></Skeleton>
        </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Videos" :value="stats.totalVideos" :trend="{ value: 12, isPositive: true }" />

        <StatsCard title="Total Views" :value="stats.totalViews.toLocaleString()"
            :trend="{ value: 8, isPositive: true }" />

        <StatsCard title="Storage Used"
            :value="`${formatBytes(stats.storageUsed)} / ${formatBytes(stats.storageLimit)}`" color="warning" />

        <StatsCard title="Uploads This Month" :value="stats.uploadsThisMonth" color="success"
            :trend="{ value: 25, isPositive: true }" />
    </div>
</template>
