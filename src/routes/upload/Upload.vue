<script setup lang="ts">
import UploadDropzone from './components/UploadDropzone.vue';
import RemoteUrlForm from './components/RemoteUrlForm.vue';
import { ref } from 'vue';
import { useUploadQueue } from '@/composables/useUploadQueue';
import { useUIState } from '@/stores/uiState';

const uiState = useUIState();
const mode = ref<'local' | 'remote'>('local');

const { addFiles, addRemoteUrls, pendingCount, startQueue, remainingSlots, maxItems } = useUploadQueue();

const handleFilesSelected = (files: FileList) => {
    addFiles(files);
    uiState.uploadDialogVisible = false;
};

const handleRemoteUrls = (urls: string[]) => {
    addRemoteUrls(urls);
    uiState.uploadDialogVisible = false;
};

const handleStartUpload = () => {
    startQueue();
    uiState.uploadDialogVisible = false;
};
</script>

<template>
    <Dialog v-model:visible="uiState.uploadDialogVisible" modal dismissableMask :style="{ width: '580px', maxWidth: '96vw' }">
        <template #container="{ closeCallback }">
            <div class="flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">

                <!-- ── Header ── -->
                <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
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
                            <h2 class="font-bold text-base text-slate-900 leading-tight">Upload Videos</h2>
                            <p class="text-sm text-slate-400 leading-tight mt-0.5">Add up to {{ maxItems }} videos per batch</p>
                        </div>
                    </div>

                    <!-- Mode switcher -->
                    <div class="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
                        <button @click="mode = 'local'"
                            :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all', mode === 'local' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                            Local
                        </button>
                        <button @click="mode = 'remote'"
                            :class="['px-4 py-2 text-sm font-medium rounded-lg transition-all', mode === 'remote' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
                            Remote URL
                        </button>
                    </div>
                </div>

                <!-- ── Input area ── -->
                <div class="p-5" style="height: 320px;">
                    <!-- Queue full warning -->
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
                            <p class="text-base font-semibold text-slate-700">Queue is full</p>
                            <p class="text-sm text-slate-400 mt-1">
                                Maximum {{ maxItems }} videos per batch.<br>Start or clear the current queue first.
                            </p>
                        </div>
                    </div>

                    <!-- Dropzone / URL form -->
                    <Transition v-else enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
                        leave-active-class="transition-all duration-150 ease-in"
                        leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                        <UploadDropzone v-if="mode === 'local'" :max-files="remainingSlots" @files-selected="handleFilesSelected" />
                        <RemoteUrlForm v-else :max-urls="remainingSlots" @submit="handleRemoteUrls" />
                    </Transition>
                </div>

                <!-- ── Footer ── -->
                <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <span class="text-sm text-slate-400">
                        <span v-if="remainingSlots < maxItems">
                            <span class="font-semibold"
                                :class="remainingSlots === 0 ? 'text-amber-500' : 'text-slate-600'">{{ remainingSlots }}</span>
                            / {{ maxItems }} slots remaining
                        </span>
                        <span v-else>MP4, MOV, MKV · max 10 GB per file</span>
                    </span>
                    <div class="flex items-center gap-2">
                        <button @click="closeCallback"
                            class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                            Close
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
                            Start Upload ({{ pendingCount }})
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>