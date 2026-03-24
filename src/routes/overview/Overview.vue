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
import type { StatProps } from '@/components/dashboard/StatsCard.vue';
import { formatBytes, isAdmin } from '@/lib/utils';
import { useTranslation } from 'i18next-vue';
import { useAuthStore } from '@/stores/auth';
const AdminOverview = defineAsyncComponent(() => import('./components/AdminOverview.vue'));
const {t} = useTranslation()
const auth = useAuthStore();
const recentVideosLoading = ref(true);
const recentVideos = ref<ModelVideo[]>([]);
const { data: usageSnapshot, isPending: isUsagePending, refresh } = useUsageQuery();

const stats = computed<StatProps[]>(() => [
    {
        title: 'overview.stats.totalVideos',
        value: usageSnapshot.value?.totalVideos ?? 0,
        trend: { value: 12, isPositive: true }
    },
    {
        title: 'overview.stats.totalViews',
        value: recentVideos.value.reduce((sum, v: any) => sum + (v.views || 0), 0),
        trend: { value: 8, isPositive: true }
    },
    {
        title: 'overview.stats.storageUsed',
        value: `${formatBytes(usageSnapshot.value?.totalStorage ?? 0)} / ${t('overview.stats.unlimited')}`,
        color: 'warning',
        trend: { value: 5, isPositive: false }
    }
]);
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
    refresh();
    fetchDashboardData();
});
</script>

<template>
    <div class="dashboard-overview">
        <PageHeader :title="NameGradient" :description="$t('overview.welcome.subtitle')" :breadcrumbs="[
            { label: $t('pageHeader.dashboard') }
        ]" />

        <AdminOverview v-if="isAdmin(auth.user?.role)" />
        <template v-else>
            <StatsOverview :loading="statsLoading" :stats="stats" />
            <QuickActions :loading="recentVideosLoading" />
            <RecentVideos :loading="recentVideosLoading" :videos="recentVideos" />
        </template>
        <!-- <StorageUsage :loading="loading" :stats="stats" /> -->
    </div>
</template>
