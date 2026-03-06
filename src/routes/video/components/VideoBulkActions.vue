<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { useTranslation } from 'i18next-vue';

defineProps<{
    selectedVideos: ModelVideo[];
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
    (e: 'clear'): void;
}>();

const { t } = useTranslation();
</script>

<template>
    <div v-if="selectedVideos.length > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <span class="font-medium text-sm text-gray-700">{{ t('video.bulk.selected', { count: selectedVideos.length }) }}</span>
        <div class="h-4 w-px bg-gray-200"></div>
        <button @click="emit('delete')"
            class="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
            <span class="i-heroicons-trash w-4 h-4" />
            {{ t('video.bulk.delete') }}
        </button>
        <button @click="emit('clear')" class="ml-2 text-gray-400 hover:text-gray-600">
            <span class="i-heroicons-x-mark w-5 h-5" />
        </button>
    </div>
</template>
