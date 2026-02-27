<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import { formatBytes, formatDate, getStatusSeverity } from '@/lib/utils';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

defineProps<{
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
</script>

<template>
    <div class="rounded-xl border border-gray-200 overflow-hidden">
        <div v-if="loading">
            <div class="p-4 border-b border-gray-200 last:border-b-0" v-for="i in 10" :key="i">
                <div class="flex gap-4 items-center">
                    <Skeleton width="5rem" height="3rem" borderRadius="6px" />
                    <div class="flex-1">
                        <Skeleton width="40%" height="1rem" class="mb-2" />
                        <Skeleton width="25%" height="0.75rem" />
                    </div>
                    <Skeleton width="8%" height="0.75rem" />
                    <Skeleton width="8%" height="0.75rem" />
                    <Skeleton width="4rem" height="1.5rem" borderRadius="16px" />
                    <Skeleton width="5.5rem" height="1.75rem" borderRadius="6px" />
                </div>
            </div>
        </div>
        <DataTable v-else :value="videos" dataKey="id" tableStyle="min-width: 50rem" :selection="selectedVideos"
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

            <!-- <Column header="Duration">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatDuration(data.duration) }}</span>
                </template>
            </Column> -->

            <Column header="Size">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatBytes(data.size) }}</span>
                </template>
            </Column>

            <Column header="Created">
                <template #body="{ data }">
                    <span class="text-sm text-gray-500">{{ formatDate(data.created_at, true) }}</span>
                </template>
            </Column>

            <Column header="Actions">
                <template #body="{ data }">
                    <div class="flex items-center gap-0.5">
                        <Button text rounded size="small" severity="secondary" title="Copy link"
                            @click="emit('copy', data.id)">
                            <LinkIcon class="w-4 h-4" />
                        </Button>
                        <Button text rounded size="small" title="Edit"
                            @click="emit('edit', data.id)">
                            <PencilIcon class="w-4 h-4" />
                        </Button>
                        <Button text rounded size="small" severity="danger" title="Delete"
                            @click="emit('delete', data.id)">
                            <TrashIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
