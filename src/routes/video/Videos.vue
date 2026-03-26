<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import type { Video as ModelVideo } from '@/server/api/proto/app/v1/common';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { useTranslation } from 'i18next-vue';
import { computed, createStaticVNode, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ClientOnly from '@/components/ClientOnly';
import { useAppToast } from '@/composables/useAppToast';
import { useUploadQueue } from '@/composables/useUploadQueue';
import { useUIState } from '@/stores/uiState';
import VideoBulkActions from './components/VideoBulkActions.vue';
import VideoFilters from './components/VideoFilters.vue';
import VideoTable from './components/VideoTable.vue';
import CopyVideoModal from './CopyVideoModal.vue';
import DetailVideoModal from './DetailVideoModal.vue';

const detailVideoId = ref<string>('');
const copyVideoId = ref<string>('');

const uiState = useUIState();
const { addFiles, startQueue } = useUploadQueue();
const toast = useAppToast();
const router = useRouter();
const { t } = useTranslation();
const videos = ref<ModelVideo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedStatus = ref<string>('all');
const iconHoist = createStaticVNode(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 468 534"><path d="M10 364v64c0 53 43 96 96 96h256c53 0 96-43 96-96v-64c0-18-14-32-32-32s-32 14-32 32v64c0 18-14 32-32 32H106c-18 0-32-14-32-32v-64c0-18-14-32-32-32s-32 14-32 32z" fill="color-mix(in srgb, var(--colors-white-DEFAULT) 60%, transparent)"/><path d="M217 19c9-9 25-9 34 0l144 144c7 7 9 17 5 26-3 9-12 15-22 15h-80v112c0 27-21 48-48 48h-32c-26 0-48-21-48-48V204H90c-10 0-18-6-22-15s-2-19 5-26L217 19z" fill="var(--colors-white-DEFAULT)"/></svg>`, 1)

// Pagination
const page = ref(1);
const limit = ref(10);
const total = ref(0);

// Filters
const statusOptions = computed(() => [
  { label: t('video.filters.allStatus'), value: 'all' },
  { label: t('video.filters.ready'), value: 'ready' },
  { label: t('video.filters.processing'), value: 'processing' },
  { label: t('video.filters.failed'), value: 'failed' },
]);

const fetchVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listVideos({
      page: page.value,
      limit: limit.value,
      search: searchQuery.value || undefined,
      status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
    });

    videos.value = response.videos ?? [];
    total.value = response.total ?? 0;
  } catch (err: any) {
    console.error(err);
    error.value = err?.response?.data?.message || err?.message || t('video.page.retry');
    videos.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchVideos();
};

const handleFilter = () => {
  page.value = 1;
  fetchVideos();
};

// Selection Logic
const selectedVideos = ref<ModelVideo[]>([]);

const deleteSelectedVideos = async () => {
  if (!selectedVideos.value.length || !confirm(t('video.page.deleteSelectedConfirm', { count: selectedVideos.value.length }))) return;

  try {
    await Promise.all(
      selectedVideos.value
        .map(v => v.id)
        .filter((id): id is string => Boolean(id))
        .map(id => rpcClient.deleteVideo({ id }))
    );
    selectedVideos.value = [];
    await fetchVideos();
  } catch (err) {
    console.error('Failed to delete videos', err);
    toast.add({
      severity: 'error',
      summary: t('video.detailPage.toast.deleteErrorSummary'),
      detail: t('video.detailPage.toast.deleteErrorDetail'),
      life: 3000,
    });
  }
};

const deleteVideo = async (videoId?: string) => {
  if (!videoId || !confirm(t('video.page.deleteSingleConfirm'))) return;

  try {
    await rpcClient.deleteVideo({ id: videoId });
    selectedVideos.value = selectedVideos.value.filter(v => v.id !== videoId);
    await fetchVideos();
  } catch (err) {
    console.error('Failed to delete video:', err);
    toast.add({
      severity: 'error',
      summary: t('video.detailPage.toast.deleteErrorSummary'),
      detail: t('video.detailPage.toast.deleteErrorDetail'),
      life: 3000,
    });
  }
};

onMounted(() => {
  fetchVideos();
});

// Reset drag state when upload dialog opens mid-drag
watch(() => uiState.uploadDialogVisible, (visible) => {
  if (visible) {
    dragCounter = 0;
    isDraggingOver.value = false;
  }
});

watch([selectedStatus, limit, page], () => {
  fetchVideos();
});
const editVideo = (videoId?: string) => {
  detailVideoId.value = videoId || "";
};

const copyVideo = (videoId?: string) => {
  copyVideoId.value = videoId || '';
};

// ── Drag & drop upload ──────────────────────────────────────────────────
const isDraggingOver = ref(false);
let dragCounter = 0; // track nested dragenter/dragleave pairs

// Returns true for any OS file drag (used to keep counter balanced)
const isAnyFileDrag = (e: DragEvent) =>
  Array.from(e.dataTransfer?.types ?? []).includes('Files');

// Returns true only when dragged items contain at least one video file
const isVideoDrag = (e: DragEvent): boolean => {
  if (!isAnyFileDrag(e)) return false;
  const items = e.dataTransfer?.items;
  if (items?.length) {
    return Array.from(items).some(item => item.kind === 'file' && item.type.startsWith('video/'));
  }
  return false;
};

const onWindowDragEnter = (e: DragEvent) => {
  if (uiState.uploadDialogVisible) return; // don't show overlay if dialog is open
  if (!isAnyFileDrag(e)) return; // same guard as leave — keeps counter balanced
  dragCounter++;
  if (isVideoDrag(e)) isDraggingOver.value = true; // show overlay only for video
};

const onWindowDragLeave = (e: DragEvent) => {
  if (!isAnyFileDrag(e)) return; // same guard as enter — keeps counter balanced
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    isDraggingOver.value = false;
  }
};

const onWindowDragOver = (e: DragEvent) => {
  // When upload dialog is open, let the dropzone handle its own dragover/drop.
  // Still preventDefault to block browser navigation, but stopPropagation
  // is NOT set so the dropzone's own handler can also fire.
  if (uiState.uploadDialogVisible) return;
  if (isAnyFileDrag(e)) e.preventDefault();
};

const onWindowDrop = (e: DragEvent) => {
  e.preventDefault();
  dragCounter = 0;
  isDraggingOver.value = false;
  if (uiState.uploadDialogVisible) return; // let the dialog handle it
  const allFiles = e.dataTransfer?.files;
  if (!allFiles?.length) return;
  // Only pass video files
  const dt = new DataTransfer();
  Array.from(allFiles).filter(f => f.type.startsWith('video/')).forEach(f => dt.items.add(f));
  if (!dt.files.length) return;
  const result = addFiles(dt.files);
  if (result.duplicates > 0) {
    toast.add({
      severity: 'warn',
      summary: t('video.page.duplicateSummary'),
      detail: result.duplicates > 1
        ? t('video.page.duplicateDetailOther', { count: result.duplicates })
        : t('video.page.duplicateDetailOne', { count: result.duplicates }),
      life: 4000,
    });
  }
  if (result.added > 0) startQueue();
};

onMounted(() => {
  window.addEventListener('dragenter', onWindowDragEnter);
  window.addEventListener('dragleave', onWindowDragLeave);
  window.addEventListener('dragover', onWindowDragOver);
  window.addEventListener('drop', onWindowDrop);
});

onUnmounted(() => {
  window.removeEventListener('dragenter', onWindowDragEnter);
  window.removeEventListener('dragleave', onWindowDragLeave);
  window.removeEventListener('dragover', onWindowDragOver);
  window.removeEventListener('drop', onWindowDrop);
});
</script>

<template>
  <div>
    <PageHeader :title="t('video.page.title')" :description="t('video.page.description')" :breadcrumbs="[
      { label: t('pageHeader.dashboard'), to: '/' },
      { label: t('nav.videos') }
    ]" :actions="[
      {
        label: t('video.page.uploadAction'),
        icon: iconHoist,
        variant: 'primary',
        onClick: () => uiState.toggleUploadDialog()
      }
    ]" />

    <VideoBulkActions :selectedVideos="selectedVideos" @delete="deleteSelectedVideos" @clear="selectedVideos = []" />
    <VideoFilters :loading="loading" v-model:searchQuery="searchQuery" :selectedStatus="selectedStatus"
      v-model:page="page" v-model:limit="limit" :total="total" ref="videoFilters" :statusOptions="statusOptions"
      @search="handleSearch" @filter="handleFilter" />

    <Transition name="fade" mode="out-in">
      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span class="i-heroicons-exclamation-circle text-red-500 text-4xl mb-3 inline-block" />
        <p class="text-red-700 font-medium">{{ error }}</p>
        <button @click="fetchVideos"
          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          {{ t('video.page.retry') }}
        </button>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="videos.length === 0 && !loading" :title="t('video.page.emptyTitle')"
        :description="t('video.page.emptyDescription')"
        imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" :actionLabel="t('video.page.emptyAction')"
        :onAction="() => uiState.toggleUploadDialog()" />
      <!-- Grid View -->
      <!-- <VideoGrid :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo" v-else-if="viewMode === 'grid'" /> -->

      <!-- Table View -->
      <VideoTable v-else :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo"
        @edit="editVideo" @copy="copyVideo" />
    </Transition>
    <DetailVideoModal :videoId="detailVideoId" @close="detailVideoId = ''" />
    <CopyVideoModal :videoId="copyVideoId" @close="copyVideoId = ''" />

    <!-- Global drag & drop overlay -->
    <ClientOnly>
      <Teleport to="body">
        <div v-if="isDraggingOver"
          class="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
          aria-hidden="true">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />
          <!-- Card -->
          <div class="animate-spring-card relative flex flex-col items-center gap-3 select-none">
            <div class="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p class="text-lg font-semibold text-primary">{{ t('video.page.uploadDropTitle') }}</p>
            <p class="text-sm text-primary/70">{{ t('video.page.uploadDropSubtitle') }}</p>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>
