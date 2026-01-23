<script setup lang="ts">
import { client, type ModelVideo } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { onMounted, ref } from 'vue';
import QuickActions from './components/QuickActions.vue';
import RecentVideos from './components/RecentVideos.vue';
import StatsOverview from './components/StatsOverview.vue';
import StorageUsage from './components/StorageUsage.vue';
import WelcomeBanner from './components/WelcomeBanner.vue';

const loading = ref(true);
const recentVideos = ref<ModelVideo[]>([]);

// Mock stats data (in real app, fetch from API)
const stats = ref({
    totalVideos: 0,
    totalViews: 0,
    storageUsed: 0,
    storageLimit: 10737418240, // 10GB in bytes
    uploadsThisMonth: 0
});

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        // Fetch recent videos
        const response = await client.videos.videosList({ page: 1, limit: 5 });
        const body = response.data as any;

        if (body.data && Array.isArray(body.data)) {
            recentVideos.value = body.data;
            stats.value.totalVideos = body.data.length;
        } else if (Array.isArray(body)) {
            recentVideos.value = body;
            stats.value.totalVideos = body.length;
        }

        // Calculate mock stats
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
        <PageHeader title="Dashboard" description="Welcome back! Here's what's happening with your videos."
            :breadcrumbs="[
                { label: 'Dashboard' }
            ]" />

        <WelcomeBanner />

        <!-- Stats Grid -->
        <StatsOverview :loading="loading" :stats="stats" />

        <!-- Quick Actions -->
        <QuickActions :loading="loading" />

        <!-- Recent Videos -->
        <RecentVideos :loading="loading" :videos="recentVideos" />

        <!-- Storage Usage -->
        <!-- <StorageUsage :loading="loading" :stats="stats" /> -->
    </div>
</template>
