<script setup lang="ts">
import { ref, onMounted, createStaticVNode, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import { client, type ModelVideo } from '@/api/client';
import { fetchMockVideos } from '@/mocks/videos';

import VideoFilters from './components/VideoFilters.vue';
import VideoGrid from './components/VideoGrid.vue';
import VideoTable from './components/VideoTable.vue';
import VideoBulkActions from './components/VideoBulkActions.vue';

const router = useRouter();
const videos = ref<ModelVideo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedStatus = ref<string>('all');
const viewMode = ref<'grid' | 'table'>('table');
const iconHoist = createStaticVNode(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1zM16 7l-4-4m0 0L8 7m4-4v12" /></svg>`, 1)

// Pagination
const page = ref(1);
const limit = ref(10);
const total = ref(0);

// Filters
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Ready', value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
];

const fetchVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Attempt to fetch from API
    // const response = await client.videos.videosList({ page: page.value, limit: limit.value });
    // const body = response.data.data

    // Use mock API
    const response = await fetchMockVideos({
      page: page.value,
      limit: limit.value,
      searchQuery: searchQuery.value,
      status: selectedStatus.value
    });

    videos.value = response.data;
    total.value = response.total;

  } catch (err: any) {
    console.error(err);
    // Fallback to empty on error
    console.log('Using mock data due to API error');
    videos.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchVideos();
};

const handleFilter = () => {
  page.value = 1;
  fetchVideos();
};

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchVideos();
};

// Selection Logic
const selectedVideos = ref<ModelVideo[]>([]);

const deleteSelectedVideos = async () => {
  if (!selectedVideos.value.length || !confirm(`Delete ${selectedVideos.value.length} videos?`)) return;

  try {
    // Mock delete
    const idsToDelete = selectedVideos.value.map(v => v.id);
    videos.value = videos.value.filter(v => v.id && !idsToDelete.includes(v.id));
    selectedVideos.value = [];
    // In real app: await client.videos.bulkDelete(...) or loop
  } catch (err) {
    console.error("Failed to delete videos", err);
  }
};

const deleteVideo = async (videoId?: string) => {
  if (!videoId || !confirm('Are you sure you want to delete this video?')) return;

  try {
    videos.value = videos.value.filter(v => v.id !== videoId);
    // If deleted video was in selection, remove it
    selectedVideos.value = selectedVideos.value.filter(v => v.id !== videoId);
  } catch (err) {
    console.error('Failed to delete video:', err);
  }
};

onMounted(() => {
  fetchVideos();
});

watch([searchQuery, selectedStatus, limit, page], () => {
  fetchVideos();
});
</script>

<template>
  <div>
    <PageHeader title="My Videos" description="Manage and organize your video library" :breadcrumbs="[
      { label: 'Dashboard', to: '/' },
      { label: 'Videos' }
    ]" :actions="[
      {
        label: 'Upload Video',
        icon: iconHoist,
        variant: 'primary',
        onClick: () => router.push('/upload')
      }
    ]" />

    <VideoBulkActions :selectedVideos="selectedVideos" @delete="deleteSelectedVideos" @clear="selectedVideos = []" />
    <VideoFilters :loading="loading" v-model:searchQuery="searchQuery" :selectedStatus="selectedStatus" v-model:viewMode="viewMode"
      v-model:page="page" v-model:limit="limit" :total="total" ref="videoFilters" :statusOptions="statusOptions"
      @search="handleSearch" @filter="handleFilter" />

    <Transition name="fade" mode="out-in">
      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span class="i-heroicons-exclamation-circle text-red-500 text-4xl mb-3 inline-block" />
        <p class="text-red-700 font-medium">{{ error }}</p>
        <button @click="fetchVideos"
          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="videos.length === 0 && !loading" title="No videos found"
        description="You haven't uploaded any videos yet. Start by uploading your first video!"
        imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" actionLabel="Upload Video"
        :onAction="() => router.push('/upload')" />
      <!-- Grid View -->
      <VideoGrid :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo" v-else-if="viewMode === 'grid'" />

      <!-- Table View -->
      <VideoTable v-else :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo" />
    </Transition>
  </div>
</template>
