<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { formatBytes, formatDate, formatDuration, getStatusSeverity } from '@/lib/utils';
import ArrowDownTray from '@/components/icons/ArrowDownTray.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { defineEmits, defineProps } from 'vue';

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
        <DataTable :value="videos" dataKey="id" tableStyle="min-width: 50rem" :selection="selectedVideos"
            @update:selection="emit('update:selectedVideos', $event)">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column header="Video">
                <template #body="{ data }">
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
                            <p class="text-sm text-gray-500 truncate">{{ data.description || 'No description' }}</p>
                        </div>
                    </div>
                </template>
            </Column>

            <Column header="Status">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)"
                        class="capitalize px-2 py-0.5 text-xs" />
                </template>
            </Column>

            <Column header="Duration">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatDuration(data.duration) }}</span>
                </template>
            </Column>

            <Column header="Size">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatBytes(data.size) }}</span>
                </template>
            </Column>

            <Column header="Upload Date">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatDate(data.created_at) }}</span>
                </template>
            </Column>

            <Column header="Actions">
                <template #body="{ data }">
                    <div class="flex items-center gap-1">
                        <button
                            class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                            title="Download">
                            <ArrowDownTray class="w-4 h-4" />
                        </button>
                        <button
                            class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                            title="Copy Link">
                            <LinkIcon class="w-4 h-4" />
                        </button>
                        <div class="w-px h-3 bg-gray-200 mx-1"></div>
                        <router-link :to="{ name: 'video-edit', params: { id: data.id } }"
                            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-block"
                            title="Edit">
                            <PencilIcon class="w-4 h-4" />
                        </router-link>
                        <button @click="emit('delete', data.id)"
                            class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete">
                            <TrashIcon class="w-4 h-4" />
                        </button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
