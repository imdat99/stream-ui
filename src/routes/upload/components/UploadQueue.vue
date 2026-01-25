<script setup lang="ts">
import UploadQueueItem, { type QueueItem } from './UploadQueueItem.vue';

defineProps<{
    items?: QueueItem[];
    totalSize?: string;
    completeCount?: number;
}>();

const emit = defineEmits<{
    removeItem: [id: string];
    publish: [];
}>();
</script>

<template>
    <aside class="w-[420px] bg-gray-100 rounded-xl flex flex-col h-[calc(100svh-64px)] sticky top-16">
        <div class="p-6 border-b border-slate-100/80 flex items-center justify-between shrink-0">
            <div>
                <h2 class="text-lg font-bold text-slate-900">Upload Queue</h2>
                <p class="text-sm text-slate-500 mt-1" id="queue-status">
                    {{ items?.length ? `${items.length} task(s)` : 'No tasks yet' }}
                </p>
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                    <path d="m16 12 5 3-5 3v-6Z" />
                </svg>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5 relative" id="queue-list">
            <div v-if="!items?.length" id="empty-queue"
                class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32 mb-4 text-slate-300" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                </svg>
                <p class="text-slate-400 font-medium">Empty queue!</p>
            </div>

            <UploadQueueItem v-for="item in items" :key="item.id" :item="item"
                @remove="emit('removeItem', $event)" />
        </div>

        <div class="p-6 border-t-2 border-white rounded-b-2xl shrink-0">
            <div class="flex items-center justify-between text-sm mb-4 font-medium">
                <span class="text-slate-500">Total size:</span>
                <span class="text-slate-900">{{ totalSize || '0 MB' }}</span>
            </div>
            <button @click="emit('publish')"
                class="btn btn-outline-primary w-full flex items-center justify-center gap-2" id="btn-publish"
                :disabled="!completeCount">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
                Complete & Publish ({{ completeCount || 0 }})
            </button>
        </div>
    </aside>
</template>
