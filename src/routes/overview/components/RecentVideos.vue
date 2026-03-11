<script setup lang="ts">
import { ModelVideo } from '@/api/client';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import { formatDate, formatDuration } from '@/lib/utils';
import { useTranslation } from 'i18next-vue';
import { useRouter } from 'vue-router';
import { useUIState } from '@/stores/uiState';

interface Props {
    loading: boolean;
    videos: ModelVideo[];
}

defineProps<Props>();

const router = useRouter();
const uiState = useUIState();
const { t } = useTranslation();

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
                <div class="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                <div class="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="p-4 border-b border-gray-200" v-for="i in 5" :key="i">
                    <div class="flex gap-4">
                        <div class="w-16 h-10 bg-gray-200 rounded animate-pulse" />
                        <div class="flex-1 space-y-2">
                            <div class="w-[30%] h-4 bg-gray-200 rounded animate-pulse" />
                            <div class="w-[20%] h-3 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else>
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">{{ t('overview.recentVideos.title') }}</h2>
                <router-link to="/videos"
                    class="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    {{ t('overview.recentVideos.viewAll') }}
                    <span class="i-heroicons-arrow-right w-4 h-4" />
                </router-link>
            </div>

            <EmptyState v-if="videos.length === 0" :title="t('overview.recentVideos.emptyTitle')"
                :description="t('overview.recentVideos.emptyDescription')"
                imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" :actionLabel="t('overview.recentVideos.emptyAction')"
                :onAction="() => uiState.toggleUploadDialog()" />

            <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ t('overview.recentVideos.table.video') }}</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ t('overview.recentVideos.table.status') }}</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ t('overview.recentVideos.table.duration') }}</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ t('overview.recentVideos.table.uploadDate') }}</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {{ t('overview.recentVideos.table.actions') }}</th>
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
                                                {{ video.description || t('overview.recentVideos.noDescription') }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        :class="['px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap', getStatusClass(video.status)]">
                                        {{ video.status || t('overview.recentVideos.unknownStatus') }}
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
                                        <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" :title="t('overview.recentVideos.actionEdit')">
                                            <span class="i-heroicons-pencil w-4 h-4 text-gray-600" />
                                        </button>
                                        <button class="p-1.5 hover:bg-gray-100 rounded transition-colors" :title="t('overview.recentVideos.actionShare')">
                                            <span class="i-heroicons-share w-4 h-4 text-gray-600" />
                                        </button>
                                        <button class="p-1.5 hover:bg-red-100 rounded transition-colors" :title="t('overview.recentVideos.actionDelete')">
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
