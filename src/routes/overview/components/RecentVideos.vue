<script setup lang="ts">
import { ModelVideo } from '@/api/client';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import { formatBytes, formatDate, formatDuration } from '@/lib/utils';
import Skeleton from 'primevue/skeleton';
import { useRouter } from 'vue-router';

interface Props {
    loading: boolean;
    videos: ModelVideo[];
}

defineProps<Props>();

const router = useRouter();

const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase()) {
        case 'ready': return 'bg-green-100 text-green-700';
        case 'processing': return 'bg-yellow-100 text-yellow-700';
        case 'failed': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};
</script>

<template>
    <div class="mb-8">
        <div v-if="loading">
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

        <div v-else>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">Recent Videos</h2>
                <router-link to="/video"
                    class="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    View all
                    <span class="i-heroicons-arrow-right w-4 h-4" />
                </router-link>
            </div>

            <EmptyState v-if="videos.length === 0" title="No videos found"
                description="You haven't uploaded any videos yet. Start by uploading your first video!"
                imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" actionLabel="Upload Video"
                :onAction="() => router.push('/upload')" />

            <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Video</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Upload Date</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions</th>
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
                                            <p class="text-sm text-gray-500 truncate">
                                                {{ video.description || 'No description' }}</p>
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
    </div>
</template>
