<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import { client, type ModelVideo } from '@/api/client';
import Skeleton from 'primevue/skeleton';

const router = useRouter();
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

const quickActions = [
  {
    title: 'Upload Video',
    description: 'Upload a new video to your library',
    icon: 'i-heroicons-cloud-arrow-up',
    color: 'bg-gradient-to-br from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    onClick: () => router.push('/upload')
  },
  {
    title: 'Video Library',
    description: 'Browse all your videos',
    icon: 'i-heroicons-film',
    color: 'bg-gradient-to-br from-blue-100 to-blue-50',
    iconColor: 'text-blue-600',
    onClick: () => router.push('/video')
  },
  {
    title: 'Analytics',
    description: 'Track performance & insights',
    icon: 'i-heroicons-chart-bar',
    color: 'bg-gradient-to-br from-purple-100 to-purple-50',
    iconColor: 'text-purple-600',
    onClick: () => {}
  },
  {
    title: 'Manage Plan',
    description: 'Upgrade or change your plan',
    icon: 'i-heroicons-credit-card',
    color: 'bg-gradient-to-br from-orange-100 to-orange-50',
    iconColor: 'text-orange-600',
    onClick: () => router.push('/plans')
  },
];

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

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusClass = (status?: string) => {
  switch(status?.toLowerCase()) {
    case 'ready': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const storagePercentage = computed(() => {
  return Math.round((stats.value.storageUsed / stats.value.storageLimit) * 100);
});

const storageBreakdown = computed(() => {
  const videoSize = stats.value.storageUsed;
  const thumbSize = stats.value.totalVideos * 300 * 1024; // ~300KB per thumbnail
  const otherSize = stats.value.totalVideos * 100 * 1024; // ~100KB other files
  const total = videoSize + thumbSize + otherSize;
  
  return [
    { label: 'Videos', size: videoSize, percentage: (videoSize / total) * 100, color: 'bg-primary' },
    { label: 'Thumbnails & Assets', size: thumbSize, percentage: (thumbSize / total) * 100, color: 'bg-blue-500' },
    { label: 'Other Files', size: otherSize, percentage: (otherSize / total) * 100, color: 'bg-gray-400' },
  ];
});

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="dashboard-overview">
    <PageHeader 
      title="Dashboard" 
      description="Welcome back! Here's what's happening with your videos."
      :breadcrumbs="[
        { label: 'Dashboard' }
      ]"
    />

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse">
      <!-- Stats Grid Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
             <div class="space-y-2">
                <Skeleton width="5rem" height="1rem" class="mb-2"></Skeleton>
                <Skeleton width="8rem" height="2rem"></Skeleton>
             </div>
             <Skeleton shape="circle" size="3rem"></Skeleton>
          </div>
          <Skeleton width="4rem" height="1rem"></Skeleton>
        </div>
      </div>

       <!-- Quick Actions Skeleton -->
       <div class="mb-8">
         <Skeleton width="10rem" height="1.5rem" class="mb-4"></Skeleton>
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div v-for="i in 4" :key="i" class="p-6 rounded-xl border border-gray-200">
                <Skeleton shape="circle" size="3rem" class="mb-4"></Skeleton>
                <Skeleton width="8rem" height="1.25rem" class="mb-2"></Skeleton>
                <Skeleton width="100%" height="1rem"></Skeleton>
             </div>
         </div>
       </div>

       <!-- Recent Videos Skeleton -->
       <div class="mb-8">
           <div class="flex items-center justify-between mb-4">
              <Skeleton width="8rem" height="1.5rem"></Skeleton>
              <Skeleton width="5rem" height="1rem"></Skeleton>
           </div>
           <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
               <div class="p-4 border-b border-gray-200" v-for="i in 5" :key="i">
                  <div class="flex gap-4">
                     <Skeleton width="4rem" height="2.5rem" class="rounded"></Skeleton>
                     <div class="flex-1 space-y-2">
                        <Skeleton width="30%" height="1rem"></Skeleton>
                        <Skeleton width="20%" height="0.8rem"></Skeleton>
                     </div>
                  </div>
               </div>
           </div>
       </div>
    </div>

    <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Videos"
          :value="stats.totalVideos"
          icon="i-heroicons-film"
          color="primary"
          :trend="{ value: 12, isPositive: true }"
        />
        
        <StatsCard
          title="Total Views"
          :value="stats.totalViews.toLocaleString()"
          icon="i-heroicons-eye"
          color="info"
          :trend="{ value: 8, isPositive: true }"
        />
        
        <StatsCard
          title="Storage Used"
          :value="`${formatBytes(stats.storageUsed)} / ${formatBytes(stats.storageLimit)}`"
          icon="i-heroicons-server"
          color="warning"
        />
        
        <StatsCard
          title="Uploads This Month"
          :value="stats.uploadsThisMonth"
          icon="i-heroicons-arrow-up-tray"
          color="success"
          :trend="{ value: 25, isPositive: true }"
        />
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            v-for="action in quickActions"
            :key="action.title"
            @click="action.onClick"
            :class="[
              'p-6 rounded-xl text-left transition-all duration-200',
              'border border-gray-200 hover:border-primary hover:shadow-lg',
              'group press-animated',
              action.color
            ]"
          >
            <div :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white/80', action.iconColor]">
              <span :class="[action.icon, 'w-6 h-6']" />
            </div>
            <h3 class="font-semibold mb-1 group-hover:text-primary transition-colors">{{ action.title }}</h3>
            <p class="text-sm text-gray-600">{{ action.description }}</p>
          </button>
        </div>
      </div>

      <!-- Recent Videos -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Recent Videos</h2>
          <router-link 
            to="/video"
            class="text-sm text-primary hover:underline font-medium flex items-center gap-1"
          >
            View all
            <span class="i-heroicons-arrow-right w-4 h-4" />
          </router-link>
        </div>

        <div v-if="recentVideos.length === 0" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span class="i-heroicons-film w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-600 mb-4">No videos yet</p>
          <router-link
            to="/upload"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <span class="i-heroicons-plus w-5 h-5" />
            Upload your first video
          </router-link>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="video in recentVideos" :key="video.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <span class="i-heroicons-film text-gray-400 text-xl" />
                        </div>
                      </div>
                      <div class="min-w-0">
                        <p class="font-medium text-gray-900 truncate">{{ video.title }}</p>
                        <p class="text-sm text-gray-500 truncate">{{ video.description || 'No description' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(video.status)]">
                      {{ video.status || 'Unknown' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ formatDuration(video.duration) }}
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
                      <button class="p-1.5 hover:bg-red-100 rounded transition-colors" title="Delete">
                        <span class="i-heroicons-trash w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Storage Usage -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">Storage Usage</h2>
        
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ formatBytes(stats.storageUsed) }} of {{ formatBytes(stats.storageLimit) }} used
            </span>
            <span class="text-sm font-medium" :class="storagePercentage > 80 ? 'text-danger' : 'text-gray-700'">
              {{ storagePercentage }}%
            </span>
          </div>
          
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500 rounded-full"
              :class="storagePercentage > 80 ? 'bg-danger' : 'bg-primary'"
              :style="{ width: `${storagePercentage}%` }"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div 
            v-for="item in storageBreakdown"
            :key="item.label"
            class="flex items-center justify-between text-sm"
          >
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
              <p class="text-sm font-medium text-yellow-800">Storage running low</p>
              <p class="text-sm text-yellow-700 mt-1">
                Consider upgrading your plan to get more storage.
                <router-link to="/plans" class="underline font-medium">View plans</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
