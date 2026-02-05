<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { formatBytes, formatDate, formatDuration, getStatusClass } from '@/lib/utils';

defineProps<{
    videos: ModelVideo[];
    selectedVideos: ModelVideo[];
}>();

const emit = defineEmits<{
    (e: 'update:selectedVideos', value: ModelVideo[]): void;
    (e: 'delete', videoId: string): void;
}>();
</script>

<template>
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[50rem]">
                <thead>
                    <tr class="border-b border-gray-200 bg-gray-50">
                        <th class="w-12 px-4 py-3 text-left">
                            <input type="checkbox" class="rounded border-gray-300" />
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                        <th class="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="video in videos" :key="video.id" class="hover:bg-gray-50">
                        <td class="px-4 py-3">
                            <input 
                                type="checkbox" 
                                :checked="selectedVideos.some(v => v.id === video.id)"
                                @change="emit('update:selectedVideos', selectedVideos.some(v => v.id === video.id) ? selectedVideos.filter(v => v.id !== video.id) : [...selectedVideos, video])"
                                class="rounded border-gray-300"
                            />
                        </td>
                        <td class="px-4 py-3">
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
                        <td class="px-4 py-3">
                            <span
                                :class="['px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap', getStatusClass(video.status)]">
                                {{ video.status || 'Unknown' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ formatDuration(video.duration) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ formatBytes(video.size) }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(video.created_at) }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-1">
                                <button
                                    class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                                    title="Download">
                                    <span class="i-heroicons-arrow-down-tray w-4 h-4" />
                                </button>
                                <button
                                    class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                                    title="Copy Link">
                                    <span class="i-heroicons-link w-4 h-4" />
                                </button>
                                <div class="w-px h-3 bg-gray-200 mx-1"></div>
                                <button
                                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit">
                                    <span class="i-heroicons-pencil w-4 h-4" />
                                </button>
                                <button @click="emit('delete', video.id!)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete">
                                    <span class="i-heroicons-trash w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
