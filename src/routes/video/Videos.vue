<script setup lang="ts">
import { ref, onMounted, createStaticVNode, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import { client, type ModelVideo } from '@/api/client';
import Skeleton from 'primevue/skeleton';


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
const limit = ref(20);
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
    const response = await client.videos.videosList({ page: page.value, limit: limit.value });
    const body = response.data.data
    // console.log('Fetched videos:', body);
    if (body.videos && Array.isArray(body.videos)) {
      videos.value = body.videos;
      total.value = body.total || body.videos.length;
    } else if (Array.isArray(body)) {
      videos.value = body;
      total.value = body.length;
    } else {
      console.warn('Unexpected video list format:', body);
      videos.value = [];
    }

    // Apply filters
    if (searchQuery.value) {
      videos.value = videos.value.filter(v =>
        v.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    if (selectedStatus.value !== 'all') {
      videos.value = videos.value.filter(v =>
        v.status?.toLowerCase() === selectedStatus.value.toLowerCase()
      );
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.message || 'Failed to load videos';
  } finally {
    loading.value = false;
  }
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusClass = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'ready': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
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

const deleteVideo = async (videoId?: string) => {
  if (!videoId || !confirm('Are you sure you want to delete this video?')) return;

  try {
    // await client.videos.videosDelete({ id: videoId });
    fetchVideos();
  } catch (err) {
    console.error('Failed to delete video:', err);
  }
};



onMounted(() => {
  fetchVideos();
});
</script>

<template>
  <div class="videos-page">
    <PageHeader title="My Videos" description="Manage and organize your video library" :breadcrumbs="[
      { label: 'Dashboard', to: '/' },
      { label: 'Videos' }
    ]" :actions="[
      {
        label: 'Upload Video',
        // icon: 'i-heroicons-cloud-arrow-up',
        icon: iconHoist,
        variant: 'primary',
        onClick: () => router.push('/upload')
      }
    ]" />

    <!-- Filters & Search -->
    <div class="border-b border-gray-200 pb-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 bg-white">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="-10 -258 534 534">
              <path
                d="M384-40c0-97-79-176-176-176S32-137 32-40s79 176 176 176S384 57 384-40zm-41 158c-36 31-83 50-135 50C93 168 0 75 0-40s93-208 208-208 208 93 208 208c0 52-19 99-50 135l141 142c7 6 7 16 0 22-6 7-16 7-22 0L343 118z"
                fill="#1e3050" />
            </svg>
            <input v-model="searchQuery" @keyup.enter="handleSearch" type="text"
              placeholder="Search videos by title or description..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
        </div>

        <!-- Status Filter -->
        <FloatLabel class="w-full md:w-56" variant="on">
          <Select v-model="selectedStatus" inputId="on_label" :options="statusOptions" optionLabel="label"
            optionValue="value" class="w-full" />
          <label for="on_label">Status</label>
        </FloatLabel>
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-slate-200 rounded-lg p-1">
          <button @click="viewMode = 'table'" :class="[
            'px-3 py-1.5 rounded transition-colors',
            viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
          ]" title="Table view">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
              :class="viewMode === 'table' ? 'text-primary' : 'text-gray-600'" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button @click="viewMode = 'grid'" :class="[
            'px-3 py-1.5 rounded transition-colors',
            viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
          ]" title="Grid view">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
              :class="viewMode === 'grid' ? 'text-primary' : 'text-gray-600'" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <!-- Grid Skeleton -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Skeleton height="150px" width="100%"></Skeleton>
          <div class="p-4">
            <Skeleton width="80%" height="1.5rem" class="mb-2"></Skeleton>
            <Skeleton width="60%" height="1rem" class="mb-4"></Skeleton>
            <div class="flex justify-between">
              <Skeleton width="3rem" height="1rem"></Skeleton>
              <Skeleton width="3rem" height="1rem"></Skeleton>
            </div>
          </div>
        </div>
      </div>
      <!-- Table Skeleton -->
      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200" v-for="i in 5" :key="i">
          <div class="flex gap-4 items-center">
            <Skeleton width="5rem" height="3rem" class="rounded"></Skeleton>
            <div class="flex-1">
              <Skeleton width="40%" height="1.2rem" class="mb-2"></Skeleton>
              <Skeleton width="30%" height="1rem"></Skeleton>
            </div>
            <Skeleton width="10%" height="1rem"></Skeleton>
            <Skeleton width="10%" height="1rem"></Skeleton>
            <Skeleton width="5rem" height="2rem" borderRadius="16px"></Skeleton>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <span class="i-heroicons-exclamation-circle text-red-500 text-4xl mb-3 inline-block" />
      <p class="text-red-700 font-medium">{{ error }}</p>
      <button @click="fetchVideos"
        class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <EmptyState v-else-if="videos.length === 0" title="No videos found"
      description="You haven't uploaded any videos yet. Start by uploading your first video!"
      imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" actionLabel="Upload Video"
      :onAction="() => router.push('/upload')" />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="video in videos" :key="video.id"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
        <div class="aspect-video bg-gray-200 relative overflow-hidden">
          <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <span class="i-heroicons-film text-4xl" />
          </div>

          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              class="w-12 h-12 bg-white hover:bg-primary text-gray-800 hover:text-white rounded-full flex items-center justify-center transition-colors">
              <span class="i-heroicons-play-20-solid text-xl ml-0.5" />
            </button>
          </div>

          <span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {{ formatDuration(video.duration) }}
          </span>
        </div>

        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1 truncate" :title="video.title">{{ video.title }}</h3>
          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ video.description || 'No description' }}</p>

          <div class="flex items-center justify-between">
            <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(video.status)]">
              {{ video.status }}
            </span>

            <div class="flex items-center gap-1">
              <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
                <span class="i- w-4 h-4 text-gray-600" />
              </button>
              <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Share">
                <span class="i-heroicons-share w-4 h-4 text-gray-600" />
              </button>
              <button @click="deleteVideo(video.id)" class="p-1.5 hover:bg-red-100 rounded transition-colors"
                title="Delete">
                <span class="i-heroicons-trash w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{{ formatDate(video.created_at) }}</span>
            <span>{{ formatBytes(video.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="video in videos" :key="video.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title"
                      class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <span class="i-heroicons-film text-gray-400 text-xl" />
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-gray-900 truncate">{{ video.title }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ video.description || 'No description' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap', getStatusClass(video.status)]">
                  {{ video.status || 'Unknown' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDuration(video.duration) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatBytes(video.size) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(video.created_at) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
                    <span class="i-heroicons-pencil w-4 h-4 text-gray-600" />
                  </button>
                  <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Share">
                    <span class="i-heroicons-share w-4 h-4 text-gray-600" />
                  </button>
                  <button @click="deleteVideo(video.id)" class="p-1.5 hover:bg-red-100 rounded transition-colors"
                    title="Delete">
                    <span class="i-heroicons-trash w-4 h-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="total > limit" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ (page - 1) * limit + 1 }}</span> to
          <span class="font-medium">{{ Math.min(page * limit, total) }}</span> of
          <span class="font-medium">{{ total }}</span> results
        </div>
        <div class="flex items-center gap-2">
          <button @click="handlePageChange(page - 1)" :disabled="page === 1"
            class="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <span class="px-4 py-1.5 bg-primary text-white rounded">{{ page }}</span>
          <button @click="handlePageChange(page + 1)" :disabled="page * limit >= total"
            class="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
