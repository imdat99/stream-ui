<script setup lang="ts">
import type { ModelVideo } from '@/api/client';

defineProps<{
    video: ModelVideo;
}>();
</script>

<template>
    <div class="rounded-xl">
        <div v-if="video.url" class="aspect-video rounded-xl bg-black overflow-hidden">
            <video 
                :src="video.url" 
                controls 
                class="w-full h-full object-contain" 
                :poster="video.thumbnail">
                Your browser does not support the video tag.
            </video>
        </div>
        <div v-else class="w-full h-48 bg-gray-200 overflow-hidden flex-shrink-0">
            <img 
                v-if="video.thumbnail" 
                :src="video.thumbnail" 
                :alt="video.title"
                class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
                <span class="i-heroicons-film text-gray-400 text-2xl" />
            </div>
        </div>
    </div>
</template>
