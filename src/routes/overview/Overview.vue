<script setup lang="tsx">
import { client as rpcClient } from '@/api/rpcclient';
import type { Video as ModelVideo } from '@/server/gen/proto/app/v1/common';
import { useUsageQuery } from '@/composables/useUsageQuery';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { computed, onMounted, ref } from 'vue';
import NameGradient from './components/NameGradient.vue';
import QuickActions from './components/QuickActions.vue';
import RecentVideos from './components/RecentVideos.vue';
import StatsOverview from './components/StatsOverview.vue';

const recentVideosLoading = ref(true);
const recentVideos = ref<ModelVideo[]>([]);
const { data: usageSnapshot, isPending: isUsagePending } = useUsageQuery();

const stats = computed(() => ({
    totalVideos: usageSnapshot.value?.totalVideos ?? 0,
    totalViews: recentVideos.value.reduce((sum, v: any) => sum + (v.views || 0), 0),
    storageUsed: usageSnapshot.value?.totalStorage ?? 0,
    storageLimit: 10737418240,
}));
const statsLoading = computed(() => recentVideosLoading.value || (isUsagePending.value && !usageSnapshot.value));

const fetchDashboardData = async () => {
    recentVideosLoading.value = true;
    try {
        const response = await rpcClient.listVideos({ page: 1, limit: 5 });
        recentVideos.value = response.videos ?? [];
    } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
    } finally {
        recentVideosLoading.value = false;
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="dashboard-overview">
        <PageHeader :title="NameGradient" :description="$t('overview.welcome.subtitle')" :breadcrumbs="[
            { label: $t('pageHeader.dashboard') }
        ]" />

        <StatsOverview :loading="statsLoading" :stats="stats" />

        <QuickActions :loading="recentVideosLoading" />

        <RecentVideos :loading="recentVideosLoading" :videos="recentVideos" />

        <!-- <StorageUsage :loading="loading" :stats="stats" /> -->
    </div>
</template>
