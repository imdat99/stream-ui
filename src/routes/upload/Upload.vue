<script setup lang="ts">
import AppDialog from '@/components/ui/AppDialog.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useUploadQueue } from '@/composables/useUploadQueue';
import { useUIState } from '@/stores/uiState';
import { useTranslation } from 'i18next-vue';
import { ref } from 'vue';
import RemoteUrlForm from './components/RemoteUrlForm.vue';
import UploadDropzone from './components/UploadDropzone.vue';
const uiState = useUIState();
const toast = useAppToast();
const mode = ref<'local' | 'remote'>('local');
const { t } = useTranslation();

const { addFiles, addRemoteUrls, pendingCount, startQueue, remainingSlots, maxItems } = useUploadQueue();

const handleFilesSelected = (files: FileList) => {
    const result = addFiles(files);
    if (result.duplicates > 0) {
        toast.add({
            severity: 'warn',
            summary: t('upload.dialog.duplicateFilesSummary'),
            detail: result.duplicates > 1
                ? t('upload.dialog.duplicateFilesDetailOther', { count: result.duplicates })
                : t('upload.dialog.duplicateFilesDetailOne', { count: result.duplicates }),
            life: 4000,
        });
    }
    if (result.added > 0) uiState.uploadDialogVisible = false;
};

const handleRemoteUrls = (urls: string[]) => {
    const result = addRemoteUrls(urls);
    if (result.duplicates > 0) {
        toast.add({
            severity: 'warn',
            summary: t('upload.dialog.duplicateUrlsSummary'),
            detail: result.duplicates > 1
                ? t('upload.dialog.duplicateUrlsDetailOther', { count: result.duplicates })
                : t('upload.dialog.duplicateUrlsDetailOne', { count: result.duplicates }),
            life: 4000,
        });
    }
    if (result.added > 0) uiState.uploadDialogVisible = false;
};

const handleStartUpload = () => {
    startQueue();
    uiState.uploadDialogVisible = false;
};
</script>

<template>
    <AppDialog
        v-model:visible="uiState.uploadDialogVisible"
        :closable="false"
        max-width-class="max-w-[580px] w-full"
    >
        <template #header="{ close }">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="font-bold text-base text-slate-900 leading-tight">{{ t('upload.dialog.title') }}</h2>
                        <p class="text-sm text-slate-400 leading-tight mt-0.5">{{ t('upload.dialog.subtitle', { maxItems }) }}</p>
                    </div>
                </div>

                <div class="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
                    <button @click="mode = 'local'"
                        :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all', mode === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                        {{ t('upload.dialog.mode.local') }}
                    </button>
                    <button @click="mode = 'remote'"
                        :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all', mode === 'remote' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                        {{ t('upload.dialog.mode.remote') }}
                    </button>
                </div>
            </div>
        </template>

        <div class="h-[320px]">
            <div v-if="remainingSlots === 0"
                class="h-full flex flex-col items-center justify-center gap-4 text-center">
                <div class="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-amber-500" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>
                <div>
                    <p class="text-base font-semibold text-slate-700">{{ t('upload.dialog.queueFullTitle') }}</p>
                    <p class="text-sm text-slate-400 mt-1">
                        {{ t('upload.dialog.queueFullDescription', { maxItems }) }}
                    </p>
                </div>
            </div>

            <Transition v-else enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                <UploadDropzone v-if="mode === 'local'" :max-files="remainingSlots" @files-selected="handleFilesSelected" />
                <RemoteUrlForm v-else :max-urls="remainingSlots" @submit="handleRemoteUrls" />
            </Transition>
        </div>

        <template #footer>
            <div class="flex items-center justify-between">
                <span class="text-sm text-slate-400">
                    <span v-if="remainingSlots < maxItems">
                        {{ t('upload.dialog.slotsRemaining', { remaining: remainingSlots, maxItems }) }}
                    </span>
                    <span v-else>{{ t('upload.dialog.formatsHint') }}</span>
                </span>
                <div class="flex items-center gap-2">
                    <button @click="uiState.uploadDialogVisible = false"
                        class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                        {{ t('common.close') }}
                    </button>
                    <button v-if="pendingCount > 0" @click="handleStartUpload"
                        class="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-accent/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                            stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {{ t('upload.dialog.startUpload', { count: pendingCount }) }}
                    </button>
                </div>
            </div>
        </template>
    </AppDialog>
</template>
