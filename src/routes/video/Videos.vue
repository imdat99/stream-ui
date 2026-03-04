<script setup lang="ts">
import { type ModelVideo } from '@/api/client';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { fetchMockVideos } from '@/mocks/videos';
import { createStaticVNode, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useUploadQueue } from '@/composables/useUploadQueue';
import { useUIState } from '@/stores/uiState';
import { useAppToast } from '@/composables/useAppToast';
import VideoBulkActions from './components/VideoBulkActions.vue';
import VideoFilters from './components/VideoFilters.vue';
import VideoTable from './components/VideoTable.vue';
import CopyVideoModal from './CopyVideoModal.vue';
import DetailVideoModal from './DetailVideoModal.vue';

const detailVideoId = ref<string>("");
const copyVideoId = ref<string>("");

const uiState = useUIState();
const { addFiles, startQueue } = useUploadQueue();
const toast = useAppToast();
const router = useRouter();
const videos = ref<ModelVideo[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedStatus = ref<string>('all');
const iconHoist = createStaticVNode(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1zM16 7l-4-4m0 0L8 7m4-4v12" /></svg>`, 1)

// Pagination
const page = ref(1);
const limit = ref(10);
const total = ref(0);

// Filters
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Ready', value: 'ready' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
];

const fetchVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Attempt to fetch from API
    // const response = await client.videos.videosList({ page: page.value, limit: limit.value });
    // const body = response.data.data

    // Use mock API
    const response = await fetchMockVideos({
      page: page.value,
      limit: limit.value,
      searchQuery: searchQuery.value,
      status: selectedStatus.value
    });

    videos.value = response.data;
    total.value = response.total;

  } catch (err: any) {
    console.error(err);
    // Fallback to empty on error
    console.log('Using mock data due to API error');
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

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchVideos();
};

// Selection Logic
const selectedVideos = ref<ModelVideo[]>([]);

const deleteSelectedVideos = async () => {
  if (!selectedVideos.value.length || !confirm(`Delete ${selectedVideos.value.length} videos?`)) return;

  try {
    // Mock delete
    const idsToDelete = selectedVideos.value.map(v => v.id);
    videos.value = videos.value.filter(v => v.id && !idsToDelete.includes(v.id));
    selectedVideos.value = [];
    // In real app: await client.videos.bulkDelete(...) or loop
  } catch (err) {
    console.error("Failed to delete videos", err);
  }
};

const deleteVideo = async (videoId?: string) => {
  if (!videoId || !confirm('Are you sure you want to delete this video?')) return;

  try {
    videos.value = videos.value.filter(v => v.id !== videoId);
    // If deleted video was in selection, remove it
    selectedVideos.value = selectedVideos.value.filter(v => v.id !== videoId);
  } catch (err) {
    console.error('Failed to delete video:', err);
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

watch([searchQuery, selectedStatus, limit, page], () => {
  fetchVideos();
});
const editVideo = (videoId?: string) => {
  detailVideoId.value = videoId || "";
};

const copyVideo = (videoId?: string) => {
  copyVideoId.value = videoId || "";
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
      summary: 'Duplicate files skipped',
      detail: `${result.duplicates} file${result.duplicates > 1 ? 's are' : ' is'} already in the queue.`,
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
    <PageHeader title="My Videos" description="Manage and organize your video library" :breadcrumbs="[
      { label: 'Dashboard', to: '/' },
      { label: 'Videos' }
    ]" :actions="[
      {
        label: 'Upload Video',
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
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="videos.length === 0 && !loading" title="No videos found"
        description="You haven't uploaded any videos yet. Start by uploading your first video!"
        imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" actionLabel="Upload Video"
        :onAction="() => router.push('/upload')" />
      <!-- Grid View -->
      <!-- <VideoGrid :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo" v-else-if="viewMode === 'grid'" /> -->

      <!-- Table View -->
      <VideoTable v-else :videos="videos" :loading="loading" v-model:selectedVideos="selectedVideos" @delete="deleteVideo" @edit="editVideo" @copy="copyVideo" />
    </Transition>
    <DetailVideoModal :videoId="detailVideoId" @close="detailVideoId = ''"/>
    <CopyVideoModal :videoId="copyVideoId" @close="copyVideoId = ''"/>

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
            <p class="text-lg font-semibold text-primary">Drop to upload</p>
            <p class="text-sm text-primary/70">Files will be added to the upload queue</p>
          </div>
        </div>
    </Teleport>
    </ClientOnly>
  </div>
</template>

