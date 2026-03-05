<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import { formatBytes, formatDate, getStatusSeverity } from '@/lib/utils';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    videos: ModelVideo[];
    selectedVideos: ModelVideo[];
    loading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:selectedVideos', value: ModelVideo[]): void;
    (e: 'delete', videoId: string): void;
    (e: 'edit', videoId: string): void;
    (e: 'copy', videoId: string): void;
}>();

const { t } = useI18n();

const severityClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warn: 'bg-yellow-100 text-yellow-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800',
};

const isAllSelected = computed(() =>
    props.videos.length > 0 && props.selectedVideos.length === props.videos.length
);

const toggleAll = () => {
    if (isAllSelected.value) {
        emit('update:selectedVideos', []);
    } else {
        emit('update:selectedVideos', [...props.videos]);
    }
};

const toggleRow = (video: ModelVideo) => {
    const exists = props.selectedVideos.some(v => v.id === video.id);
    if (exists) {
        emit('update:selectedVideos', props.selectedVideos.filter(v => v.id !== video.id));
    } else {
        emit('update:selectedVideos', [...props.selectedVideos, video]);
    }
};

const isSelected = (video: ModelVideo) =>
    props.selectedVideos.some(v => v.id === video.id);
</script>

<template>
    <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div v-if="loading">
            <div class="p-4 border-b border-gray-200 last:border-b-0" v-for="i in 10" :key="i">
                <div class="flex gap-4 items-center">
                    <div class="w-20 h-12 bg-gray-200 rounded-md animate-pulse" />
                    <div class="flex-1">
                        <div class="w-2/5 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div class="w-1/4 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div class="w-[8%] h-3 bg-gray-200 rounded animate-pulse" />
                    <div class="w-[8%] h-3 bg-gray-200 rounded animate-pulse" />
                    <div class="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                    <div class="w-22 h-7 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>
        </div>
        <table v-else class="w-full min-w-[50rem]">
            <thead>
                <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="w-12 px-4 py-3">
                        <input type="checkbox" :checked="isAllSelected" @change="toggleAll"
                            class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    </th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">{{ t('video.table.video') }}</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">{{ t('video.table.status') }}</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">{{ t('video.table.size') }}</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">{{ t('video.table.created') }}</th>
                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">{{ t('video.table.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="data in videos" :key="data.id"
                    class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                    :class="{ 'bg-primary/5': isSelected(data) }">
                    <td class="px-4 py-3">
                        <input type="checkbox" :checked="isSelected(data)" @change="toggleRow(data)"
                            class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img v-if="data.thumbnail" :src="data.thumbnail" :alt="data.title"
                                    class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center">
                                    <VideoIcon class="text-gray-400 text-xl w-5 h-5" />
                                </div>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 truncate">{{ data.title }}</p>
                                <p class="text-sm text-gray-500 truncate">{{ data.description || t('video.table.noDescription') }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="capitalize px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="severityClasses[getStatusSeverity(data.status) || 'secondary']">
                            {{ data.status }}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="text-sm text-gray-500">{{ formatBytes(data.size) }}</span>
                    </td>
                    <td class="px-4 py-3">
                        <span class="text-sm text-gray-500">{{ formatDate(data.created_at, true) }}</span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-0.5">
                            <button class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                :title="t('video.table.copyLink')" @click="emit('copy', data.id!)">
                                <LinkIcon class="w-4 h-4" />
                            </button>
                            <button class="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                                :title="t('video.table.edit')" @click="emit('edit', data.id!)">
                                <PencilIcon class="w-4 h-4" />
                            </button>
                            <button class="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                                :title="t('video.table.delete')" @click="emit('delete', data.id!)">
                                <TrashIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
