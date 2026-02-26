<script setup lang="ts">
import type { QueueItem } from '@/composables/useUploadQueue';
import { cn } from '@/lib/utils';
import { computed } from 'vue';

const props = defineProps<{
    item: QueueItem;
    minimal?: boolean;
}>();

const emit = defineEmits<{
    remove: [id: string];
    cancel: [id: string];
}>();

const statusLabel = computed(() => {
    switch (props.item.status) {
        case 'pending': return 'Pending';
        case 'uploading': return props.item.activeChunks ? `Uploading (${props.item.activeChunks} threads)` : 'Uploading...';
        case 'processing': return 'Processing...';
        case 'complete': return 'Completed';
        case 'error': return 'Failed';
        case 'fetching': return 'Fetching...';
        default: return props.item.status;
    }
});

const statusColor = computed(() => {
    switch (props.item.status) {
        case 'complete': return 'bg-green-500';
        case 'error': return 'bg-red-500';
        case 'pending': return 'bg-slate-400';
        default: return 'bg-accent';
    }
});

const canCancel = computed(() => {
    return props.item.status === 'uploading' || props.item.status === 'pending';
});
</script>

<template>
    <!-- Local Upload Item -->
    <div v-if="item.type === 'local'"
        class="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50 relative group overflow-hidden transition-all"
        :class="{ '!p-2 !border-0 !shadow-none !rounded-xl': minimal }">
        <div :class="cn('flex gap-4 relative z-10', minimal && '!gap-2')">
            <div v-if="!minimal" class="w-20 h-16 bg-slate-800 rounded-xl shrink-0 relative overflow-hidden shadow-sm">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img v-if="item.thumbnail" :src="item.thumbnail" class="w-full h-full object-cover opacity-80" alt="">
                <div class="absolute bottom-1 left-2 z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white/90" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                </div>
            </div>

            <div class="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                <div class="flex justify-between items-start gap-2">
                    <h4 class="text-sm font-bold text-slate-800 truncate">{{ item.name }}</h4>
                    <button @click="emit('remove', item.id)"
                        class="text-slate-300 hover:text-red-500 transition p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div>
                    <div class="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full animate-pulse" :class="statusColor"></span>
                            {{ statusLabel }}
                        </span>
                        <div class="flex items-center gap-2">
                            <button 
                                v-if="canCancel && !minimal" 
                                @click="emit('cancel', item.id)"
                                class="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 hover:bg-red-100 rounded transition"
                            >
                                Cancel
                            </button>
                            <span class="text-accent font-bold">{{ item.progress || 0 }}%</span>
                        </div>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                        <div class="absolute inset-0 bg-accent/20 animate-pulse w-full"></div>
                        <div class="h-full bg-accent rounded-full relative z-10 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-500"
                            :style="{ width: `${item.progress || 0}%` }">
                        </div>
                    </div>
                    <div class="flex justify-between mt-2 text-[11px] text-slate-400 font-medium">
                        <span>{{ item.uploaded || '0 MB' }} of {{ item.total || '0 MB' }}</span>
                        <span>{{ item.speed || '0 MB/s' }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Remote Fetch Item -->
    <div v-else
        class="bg-[#F0F3FF] rounded-2xl p-5 shadow-soft border border-indigo-100/50 relative overflow-hidden group transition-all hover:shadow-md"
        :class="{ '!p-3 !bg-slate-50 !border-0 !shadow-none !rounded-xl': minimal }">
        <div
            class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6366F1_1px,transparent_1px)] [background-size:16px_16px]">
        </div>

        <div class="flex gap-4 relative z-10" :class="{ '!gap-3': minimal }">
            <div v-if="!minimal"
                class="w-20 h-16 bg-indigo-100 rounded-xl shrink-0 flex items-center justify-center text-accent shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 opacity-80" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                    <line x1="8" x2="16" y1="12" y2="12" />
                </svg>
            </div>

            <div class="flex-1 min-w-0 py-1 flex flex-col justify-center">
                <div class="flex justify-between items-start gap-2">
                    <h4 class="text-sm font-bold text-slate-800 truncate">{{ item.name }}</h4>
                    <button @click="emit('remove', item.id)"
                        class="text-slate-400 hover:text-red-500 transition p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex items-center gap-3 mt-3">
                    <div
                        class="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white py-1.5 px-3 rounded-lg shadow-sm">
                        <svg v-if="item.status === 'fetching' || item.status === 'processing'"
                            xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <svg v-else-if="item.status === 'complete'" xmlns="http://www.w3.org/2000/svg"
                            class="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        {{ statusLabel }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
