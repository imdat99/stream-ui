<script setup lang="tsx">
import { client, type ModelVideo } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { onMounted, ref } from 'vue';
import NameGradient from './components/NameGradient.vue';
import QuickActions from './components/QuickActions.vue';
import RecentVideos from './components/RecentVideos.vue';
import StatsOverview from './components/StatsOverview.vue';

const loading = ref(true);
const recentVideos = ref<ModelVideo[]>([]);

const stats = ref({
    totalVideos: 0,
    totalViews: 0,
    storageUsed: 0,
    storageLimit: 10737418240,
    uploadsThisMonth: 0
});

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const response = await client.videos.videosList({ page: 1, limit: 5 });
        const body = response.data as any;

        if (body.data && Array.isArray(body.data)) {
            recentVideos.value = body.data;
            stats.value.totalVideos = body.data.length;
        } else if (Array.isArray(body)) {
            recentVideos.value = body;
            stats.value.totalVideos = body.length;
        }

        stats.value.totalViews = recentVideos.value.reduce((sum, v: any) => sum + (v.views || 0), 0);
        stats.value.storageUsed = recentVideos.value.reduce((sum, v) => sum + (v.size || 0), 0);
        stats.value.uploadsThisMonth = recentVideos.value.filter(v => {
            const uploadDate = new Date(v.created_at || '');
            const now = new Date();
            return uploadDate.getMonth() === now.getMonth() && uploadDate.getFullYear() === now.getFullYear();
        }).length;
    } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
    } finally {
        loading.value = false;
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

        <StatsOverview :loading="loading" :stats="stats" />

        <QuickActions :loading="loading" />

        <RecentVideos :loading="loading" :videos="recentVideos" />

        <!-- <StorageUsage :loading="loading" :stats="stats" /> -->
    </div>
</template>
