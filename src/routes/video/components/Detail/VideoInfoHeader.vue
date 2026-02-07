<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { getStatusSeverity } from '@/lib/utils';
import Tag from 'primevue/tag';

const props = defineProps<{
    video: ModelVideo;
}>();

const emit = defineEmits<{
    reload: [];
    toggleEdit: [];
    delete: [];
}>();

const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${mb.toFixed(2)} MB`;
};

const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};
</script>

<template>
    <div class="flex flex-col items-start justify-between mb-4 gap-4">
        <div class="flex-1">
            <!-- View Mode: Title -->
            <div class="mb-2">
                <h1 class="text-2xl font-bold text-gray-900 mb-1">
                    {{ video.title }}
                </h1>
                <p v-if="video.description" class="text-sm text-gray-600 whitespace-pre-wrap">{{ video.description }}
                </p>
            </div>
            <!-- Metadata -->
            <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ formatDate(video.created_at) }}</span>
                <span>{{ formatFileSize(video.size) }}</span>
                <span>{{ formatDuration(video.duration) }}</span>
                <Tag :value="video.status" :severity="getStatusSeverity(video.status)"
                    class="capitalize px-2 py-0.5 text-xs" />
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2">
            <!-- Save Button (Edit Mode) -->
            <!-- View Mode Buttons -->
                <Button size="small"
                    severity="secondary"
                    title="Reload video" @click="$emit('reload')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                    <span class="hidden sm:inline">Reload</span>
                </Button>
                <Button size="small" title="Edit" variant="outlined" @click="$emit('toggleEdit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                        </path>
                    </svg>
                    <span class="hidden sm:inline">Edit</span>
                </Button>
                <Button severity="danger" size="small" title="Delete" @click="$emit('delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                    </svg>
                    <span class="hidden sm:inline">Delete</span>
                </Button>
        </div>
    </div>
</template>
