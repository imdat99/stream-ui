<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { formatDate, formatDuration, getStatusSeverity } from '@/lib/utils';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import CardPopover from './CardPopover.vue';

defineProps<{
    videos: ModelVideo[];
    selectedVideos: ModelVideo[];
    loading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:selectedVideos', value: ModelVideo[]): void;
    (e: 'delete', videoId: string): void;
}>();
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div v-if="loading" v-for="i in 10" :key="i" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
        <Card v-for="video in videos" :key="video.id" v-else
            class="overflow-hidden transition group relative border-2 border-gray-200 !shadow-none"
            :class="{ '!border-primary ring-2 ring-primary': selectedVideos.some(v => v.id === video.id) }">

            <template #header>
                <div
                    class="aspect-video bg-gray-200 relative overflow-hidden group-hover:opacity-95 transition-opacity">
                    <!-- Grid Selection Checkbox -->
                    <div class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        :class="{ 'opacity-100': selectedVideos.some(v => v.id === video.id) }">
                        <Checkbox :modelValue="selectedVideos" :value="video"
                            @update:modelValue="emit('update:selectedVideos', $event)" />
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
            </template>

            <template #content>
                <div class="flex flex-col h-full">
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
                    <div class="text-xs text-gray-400 mt-auto">
                        {{ formatDate(video.created_at) }}
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="mt-auto flex items-center justify-between">
                        <Tag :value="video.status" :severity="getStatusSeverity(video.status)"
                            class="capitalize px-2 py-0.5 text-xs" />
                        <CardPopover :video="video" @delete="emit('delete', video.id || '')"/>
                    </div>
            </template>
        </Card>
    </div>
</template>
