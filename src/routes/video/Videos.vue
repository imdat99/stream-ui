<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Videos</h1>
      <router-link to="/upload" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors flex items-center">
        <span class="i-heroicons-cloud-arrow-up mr-2"></span>
        Upload Video
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center">
      <div class="i-svg-spinners-180-ring-with-bg text-4xl"></div>
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else-if="videos.length === 0" class="text-center text-gray-500 py-10">
      <p>No videos found. Upload your first video!</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="video in videos" :key="video.id" class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
        <div class="aspect-video bg-gray-200 dark:bg-gray-700 relative group">
          <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <span class="i-heroicons-video-camera text-4xl"></span>
          </div>
          
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button class="text-white bg-primary-600 p-2 rounded-full hover:bg-primary-700" title="Play">
                 <span class="i-heroicons-play-20-solid text-xl"></span>
             </button>
          </div>
          <span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">{{ formatDuration(video.duration || 0) }}</span>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1 truncate" :title="video.title">{{ video.title }}</h3>
          <p class="text-sm text-gray-500 mb-2 truncate">{{ video.description || 'No description' }}</p>
          <div class="flex justify-between items-center text-xs text-gray-400">
            <span>{{ formatDate(video.created_at) }}</span>
            <span :class="getStatusClass(video.status)">{{ video.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { client, type ModelVideo } from '@/api/client';

const videos = ref<ModelVideo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await client.videos.videosList({ page: 1, limit: 50 });
    // Based on docs.json, schema might be incomplete, assuming standard response structure
    // response.data is the body. The body should have 'data' containing the list?
    const body = response.data as any; // Cast because generated type didn't have data field
    if (body.data && Array.isArray(body.data)) {
        videos.value = body.data;
    } else if (Array.isArray(body)) {
        videos.value = body;
    } else {
        console.warn('Unexpected video list format:', body);
        videos.value = [];
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.message || 'Failed to load videos';
  } finally {
    loading.value = false;
  }
};

const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};

const getStatusClass = (status?: string) => {
    switch(status?.toLowerCase()) {
        case 'ready': return 'text-green-500';
        case 'processing': return 'text-yellow-500';
        case 'failed': return 'text-red-500';
        default: return 'text-gray-500';
    }
};

onMounted(() => {
  fetchVideos();
});
</script>
