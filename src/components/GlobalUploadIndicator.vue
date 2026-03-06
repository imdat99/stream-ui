<script setup lang="ts">
import { useUploadQueue } from '@/composables/useUploadQueue';
import UploadQueueItem from '@/routes/upload/components/UploadQueueItem.vue';
import { useUIState } from '@/stores/uiState';
import { computed, ref } from 'vue';
import { useTranslation } from 'i18next-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { items, completeCount, pendingCount, startQueue, removeItem, cancelItem, removeAll } = useUploadQueue();
const uiState = useUIState();
const { t } = useTranslation();

const isCollapsed = ref(false);

const isVisible = computed(() => items.value.length > 0);

const overallProgress = computed(() => {
    if (items.value.length === 0) return 0;
    const total = items.value.reduce((acc, item) => acc + (item.progress || 0), 0);
    return Math.round(total / items.value.length);
});

const isUploading = computed(() =>
    items.value.some(i => i.status === 'uploading' || i.status === 'fetching' || i.status === 'processing')
);

const isAllDone = computed(() =>
    items.value.length > 0 && items.value.every(i => i.status === 'complete' || i.status === 'error')
);

const statusText = computed(() => {
    if (isAllDone.value) return t('upload.indicator.allDone');
    if (isUploading.value) {
        const count = items.value.filter(i => i.status === 'uploading' || i.status === 'fetching').length;
        return t('upload.indicator.uploading', { count });
    }
    if (pendingCount.value > 0) return t('upload.indicator.waiting', { count: pendingCount.value });
    return t('upload.queueItem.status.processing');
});
const isDoneWithErrors = computed(() =>
    isAllDone.value &&
    items.value.some(i => i.status === 'error') && items.value.every(i => i.status === 'complete' || i.status === 'error')
);
const doneUpload = () => {
    router.push({ name: 'videos', query: { uploaded: 'true' } });
    removeAll();
}
watch(isAllDone, (newItems) => {
    if (newItems && items.value.every(i => i.status === 'complete')) {
        const timeout = setTimeout(() => {
            doneUpload();
            clearTimeout(timeout);
        }, 3000);
    }
});
</script>

<template>
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-4">

        <div v-if="isVisible"
            class="fixed bottom-6 right-6 z-50 w-96 rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.16)] border border-slate-100 overflow-hidden flex flex-col"
            style="max-height: 540px;">

            <!-- Header bar -->
            <div class="flex items-center gap-3 px-4 py-3.5 bg-slate-800 text-white shrink-0 cursor-pointer select-none"
                @click="isCollapsed = !isCollapsed">

                <!-- Status icon -->
                <div class="relative w-6 h-6 shrink-0">
                    <svg v-if="isUploading" class="w-6 h-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                        <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <svg v-else-if="isAllDone" class="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <svg v-else class="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold leading-tight truncate">{{ statusText }}</p>
                    <p class="text-xs text-slate-400 leading-tight mt-0.5">
                        {{ t('upload.indicator.completeProgress', { complete: completeCount, total: items.length }) }}
                    </p>
                </div>

                <!-- Controls -->
                <div class="flex items-center gap-1.5 shrink-0">
                    <!-- Start upload -->
                    <button v-if="pendingCount > 0 && !isUploading" @click.stop="startQueue"
                        class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        {{ t('upload.indicator.start') }}
                    </button>
                    <button v-else-if="isDoneWithErrors" @click.stop="doneUpload"
                        class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-500 hover:bg-green-500/80 text-white rounded-lg transition-all">
                        {{ t('upload.indicator.viewVideos') }}
                    </button>
                    <!-- Clear queue -->
                    <!-- Add more files -->
                    <button @click.stop="uiState.uploadDialogVisible = true"
                        class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        :title="t('upload.indicator.addMoreFiles')">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </button>

                    <!-- Collapse/expand -->
                    <button @click.stop="isCollapsed = !isCollapsed"
                        class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200"
                            :class="{ 'rotate-180': isCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m18 15-6-6-6 6" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Overall progress bar -->
            <div v-if="isUploading" class="h-0.5 w-full bg-slate-100 shrink-0">
                <div class="h-full bg-accent transition-all duration-500" :style="{ width: `${overallProgress}%` }">
                </div>
            </div>

            <!-- File list -->
            <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
                enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="!isCollapsed" class="flex-1 overflow-y-auto min-h-0">
                    <div class="p-3 flex flex-col gap-2">
                        <UploadQueueItem v-for="item in items" :key="item.id" :item="item" @remove="removeItem($event)"
                            @cancel="cancelItem($event)" />
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
</template>
