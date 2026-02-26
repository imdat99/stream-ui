<script setup lang="ts">
import type { QueueItem } from '@/composables/useUploadQueue';
import { computed } from 'vue';

const props = defineProps<{
    item: QueueItem;
}>();

const emit = defineEmits<{
    remove: [id: string];
    cancel: [id: string];
}>();

const statusLabel = computed(() => {
    switch (props.item.status) {
        case 'pending': return 'Pending';
        case 'uploading': return props.item.activeChunks ? `Uploading · ${props.item.activeChunks} threads` : 'Uploading...';
        case 'processing': return 'Processing...';
        case 'complete': return 'Done';
        case 'error': return 'Failed';
        case 'fetching': return 'Fetching...';
        default: return props.item.status;
    }
});

const statusVariant = computed(() => {
    switch (props.item.status) {
        case 'complete': return { dot: 'bg-green-500', text: 'text-green-600', bar: 'bg-green-500' };
        case 'error': return { dot: 'bg-red-500', text: 'text-red-500', bar: 'bg-red-500' };
        case 'pending': return { dot: 'bg-slate-300', text: 'text-slate-400', bar: 'bg-slate-300' };
        default: return { dot: 'bg-accent', text: 'text-accent', bar: 'bg-accent' };
    }
});

const isActive = computed(() =>
    props.item.status === 'uploading' || props.item.status === 'fetching' || props.item.status === 'processing'
);

const canCancel = computed(() =>
    props.item.status === 'uploading' || props.item.status === 'pending'
);

const progress = computed(() => props.item.progress || 0);
</script>

<template>
    <div class="group relative rounded-xl bg-white border border-slate-100 p-3 hover:border-gray-200 transition-all duration-200">
        <!-- Progress bar (only for uploading) -->
        <div v-if="item.type === 'local'" class="absolute z-1 h-full w-full bg-transparent rounded-xl overflow-hidden top-0 left-0">
            <div class="h-full transition-all duration-500 opacity-10"
                :class="statusVariant.bar"
                :style="{ width: `${progress}%` }">
            </div>
        </div>
        <div class="relative flex items-start gap-3 z-2">
            <!-- File type icon -->
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 my-a"
                :class="item.type === 'remote' ? 'bg-indigo-50 text-indigo-400' : 'bg-slate-100 text-slate-400'">
                <!-- Local file icon -->
                <svg v-if="item.type === 'local'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 404 532"><path d="M26 74v384c0 27 22 48 48 48h256c27 0 48-21 48-48V197c0-4 0-8-1-11H274c-31 0-56-25-56-56V27c-3-1-7-1-10-1H74c-26 0-48 22-48 48zm64 224c0-18 14-32 32-32h96c18 0 32 14 32 32v18l40-25c10-7 24 1 24 14v83c0 12-14 20-24 13l-40-25v18c0 18-14 32-32 32h-96c-18 0-32-14-32-32v-96z" fill="#a6acb9"/><path d="M208 26c3 0 7 0 10 1v103c0 31 25 56 56 56h103c1 3 1 7 1 11v261c0 27-21 48-48 48H74c-26 0-48-21-48-48V74c0-26 22-48 48-48h134zm156 137c2 2 4 4 6 7h-96c-22 0-40-18-40-40V34c3 2 5 4 7 6l123 123zM74 10c-35 0-64 29-64 64v384c0 35 29 64 64 64h256c35 0 64-29 64-64V197c0-17-7-34-19-46L253 29c-12-12-28-19-45-19H74zm144 272c9 0 16 7 16 16v96c0 9-7 16-16 16h-96c-9 0-16-7-16-16v-96c0-9 7-16 16-16h96zm-96-16c-18 0-32 14-32 32v96c0 18 14 32 32 32h96c18 0 32-14 32-32v-18l40 25c10 7 24-1 24-13v-84c0-12-14-20-24-13l-40 25v-18c0-18-14-32-32-32h-96zm176 38v84l-48-30v-24l48-30z" fill="#1e3050"/></svg>
                <!-- Remote link icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 564"><path d="M90 258h104c2-1 5-2 8-2 3-117 56-193 99-228C185 42 94 139 90 258zm128-7c28-8 73-22 135-40-5 16-9 31-14 47h103c-3-132-72-209-112-231-39 22-107 96-112 224zm51 247c10 3 21 5 32 6-9-7-18-16-27-26-2 7-3 13-5 20zm11-38c17 22 36 37 50 45 40-22 109-99 112-231H334l-6 21c-16 55-32 110-48 164zm0 0zm79-432c44 35 97 112 99 230h112c-4-119-95-216-211-230zm0 476c116-14 207-111 211-230H458c-2 117-55 195-99 230z" fill="#a6acb9"/><path d="M570 274H458c-2 118-55 195-99 230 116-14 207-111 211-230zM269 498c10 3 21 5 32 6-9-7-18-16-27-26l6-18c18 22 36 37 50 45 40-22 109-99 112-231H335l4-16h103c-3-132-72-209-112-231-39 22-107 96-112 224l-16 5c3-117 56-193 99-228C185 42 94 139 90 258h104l-55 16H90c0 5 1 10 1 14l-16 5c0-9-1-18-1-27C74 125 189 10 330 10s256 115 256 256-115 256-256 256c-23 0-45-3-66-9l5-15zm301-240c-4-119-95-216-211-230 44 35 97 112 99 230h112zM150 414l2 5 46 92 60-205-204 60 91 46 5 2zM31 373l-21-11 23-7 231-68 18-5-5 18-68 232-7 22-60-120-94 94-6 5-11-11 5-6 95-94-100-49z" fill="#1e3050"/></svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <!-- Name row -->
                <div class="flex items-start justify-between gap-2">
                    <p class="text-xs font-semibold text-slate-700 truncate leading-5">{{ item.name }}</p>
                    <button v-if="item.status == 'pending'" @click="emit('remove', item.id)"
                        class="shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Status + progress row -->
                <div class="mt-1.5">
                    <div class="flex items-center justify-between">
                        <!-- Status badge -->
                        <span class="flex items-center gap-1 text-[10px] font-medium" :class="statusVariant.text">
                            <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="[statusVariant.dot, isActive ? 'animate-pulse' : '']"></span>
                            {{ statusLabel }}
                        </span>

                        <div class="flex items-center gap-2">
                            <!-- Progress % -->
                            <span v-if="item.type === 'local' && progress > 0"
                                class="text-[10px] font-bold tabular-nums" :class="statusVariant.text">
                                {{ progress }}%
                            </span>
                            <!-- Speed -->
                            <span v-if="isActive && item.speed" class="text-[10px] text-slate-400">
                                {{ item.speed }}
                            </span>
                            <!-- Cancel button -->
                            <button v-if="canCancel" @click="emit('cancel', item.id)"
                                class="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
