<script setup lang="ts">
import FileUploadType from '@/components/icons/FileUploadType.vue';
import type { QueueItem } from '@/composables/useUploadQueue';
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    item: QueueItem;
}>();

const emit = defineEmits<{
    remove: [id: string];
    cancel: [id: string];
}>();

const { t } = useTranslation();

const statusLabel = computed(() => {
    switch (props.item.status) {
        case 'pending': return t('upload.queueItem.status.pending');
        case 'uploading': return props.item.activeChunks
            ? t('upload.queueItem.status.uploadingThreads', { threads: props.item.activeChunks })
            : t('upload.queueItem.status.uploading');
        case 'processing': return t('upload.queueItem.status.processing');
        case 'complete': return t('upload.queueItem.status.complete');
        case 'error': return t('upload.queueItem.status.error');
        case 'fetching': return t('upload.queueItem.status.fetching');
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
    props.item.status === 'uploading'
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
                <FileUploadType :filled="item.type === 'local'" />
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
                         <div class="flex gap-2 text-[10px] font-medium" :class="statusVariant.text">
                            <!-- Size -->
                            <span v-if="item.type === 'local'" >
                                {{ item.total }}
                            </span>
                            <span class="flex items-center gap-1" :class="statusVariant.text">
                                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="[statusVariant.dot, isActive ? 'animate-pulse' : '']"></span>
                                {{ statusLabel }}
                            </span>
                         </div>

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
                                {{ t('common.cancel') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
