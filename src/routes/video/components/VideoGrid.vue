<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { formatDate, formatDuration, getStatusClass } from '@/lib/utils';

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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        <div v-for="video in videos" :key="video.id"
            class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative border border-gray-200"
            :class="{ 'border-primary ring-2 ring-primary': selectedVideos.some(v => v.id === video.id) }">
            
            <div class="aspect-video bg-gray-200 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                <!-- Grid Selection Checkbox -->
                <div class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="{ 'opacity-100': selectedVideos.some(v => v.id === video.id) }">
                    <input 
                        type="checkbox" 
                        :checked="selectedVideos.some(v => v.id === video.id)"
                        @change="emit('update:selectedVideos', selectedVideos.some(v => v.id === video.id) ? selectedVideos.filter(v => v.id !== video.id) : [...selectedVideos, video])"
                        class="rounded border-gray-300"
                    />
                </div>

                <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <span class="i-heroicons-film text-3xl" />
                </div>

                <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                </div>

                <span
                    class="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {{ formatDuration(video.duration) }}
                </span>
            </div>

            <div class="p-4 flex flex-col h-full">
                <div class="flex items-start justify-between gap-2 mb-1">
                    <h3 class="font-medium text-sm text-gray-900 line-clamp-2 leading-snug flex-1"
                        :title="video.title">
                        {{ video.title }}
                    </h3>
                    <button class="text-gray-400 hover:text-gray-700">
                        <span class="i-heroicons-ellipsis-vertical w-4 h-4" />
                    </button>
                </div>

                <p class="text-xs text-gray-500 mb-3 line-clamp-1 h-4">{{ video.description || 'No description' }}
                </p>

                <div class="mt-auto flex items-center justify-between">
                    <span
                        :class="['px-1.5 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider', getStatusClass(video.status)]">
                        {{ video.status }}
                    </span>

                    <div class="text-[10px] text-gray-400">
                        {{ formatDate(video.created_at) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
