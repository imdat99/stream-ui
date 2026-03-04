<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { deleteMockVideo, fetchMockVideoById, updateMockVideo } from '@/mocks/videos';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoEditForm from './components/Detail/VideoEditForm.vue';
import VideoHeader from './components/Detail/VideoInfoHeader.vue';
import VideoPlayer from './components/Detail/VideoPlayer.vue';
import VideoSkeleton from './components/Detail/VideoSkeleton.vue';

const route = useRoute();
const router = useRouter();
const toast = useAppToast();
const confirm = useAppConfirm();

const videoId = route.params.id as string;
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const saving = ref(false);
const isEditing = ref(false);

const form = ref({
    title: '',
    description: '',
});

const fetchVideo = async () => {
    loading.value = true;
    try {
        const videoData = await fetchMockVideoById(videoId);
        if (videoData) {
            video.value = videoData;
            form.value.title = videoData.title || '';
            form.value.description = videoData.description || '';
        }
    } catch (error) {
        console.error('Failed to fetch video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load video details', life: 3000 });
        router.push('/video');
    } finally {
        loading.value = false;
    }
};

const handleReload = async () => {
    toast.add({ severity: 'info', summary: 'Info', detail: 'Reloading video...', life: 2000 });
    await fetchVideo();
};

const toggleEdit = () => {
    isEditing.value = !isEditing.value;
    if (!isEditing.value && video.value) {
        form.value.title = video.value.title || '';
        form.value.description = video.value.description || '';
    }
};

const handleSave = async () => {
    saving.value = true;
    try {
        await updateMockVideo(videoId, form.value);

        if (video.value) {
            video.value.title = form.value.title;
            video.value.description = form.value.description;
        }

        toast.add({ severity: 'success', summary: 'Success', detail: 'Video updated successfully', life: 3000 });
        isEditing.value = false;
    } catch (error) {
        console.error('Failed to save video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save changes', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const handleDelete = () => {
    confirm.require({
        message: 'Are you sure you want to delete this video? This action cannot be undone.',
        header: 'Confirm Delete',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: async () => {
            try {
                await deleteMockVideo(videoId);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Video deleted successfully', life: 3000 });
                router.push('/video');
            } catch (error) {
                console.error('Failed to delete video:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete video', life: 3000 });
            }
        },
        reject: () => { }
    });
};

const copyToClipboard = async (text: string, label: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.add({ severity: 'success', summary: 'Copied', detail: `${label} copied to clipboard`, life: 2000 });
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.add({ severity: 'success', summary: 'Copied', detail: `${label} copied to clipboard`, life: 2000 });
    }
};

onMounted(() => {
    fetchVideo();
});
const videoInfos = computed(() => {
    if (!video) return [];
    const embedUrl = video ? `${window.location.origin}/embed/${video.value?.id}` : '';
    return [
        { label: 'Video ID', value: video.value?.id ?? '' },
        { label: 'Thumbnail URL', value: video.value?.thumbnail ?? '' },
        { label: 'Embed URL', value: embedUrl },
        { label: 'Iframe Code', value: embedUrl ? `<iframe src="${embedUrl}" title="${video.value?.title}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>` : '' },
        { label: 'Share Link', value: video ? `${window.location.origin}/view/${video.value?.id}` : '' },
    ];
});
</script>

<template>
    <div>
        <PageHeader title="Video Detail" description="View and manage video details" :breadcrumbs="[
            { label: 'Dashboard', to: '/' },
            { label: 'Videos', to: '/video' },
            { label: video?.title || 'Loading...' }
        ]" />

        <div class="mx-auto p-4 w-full">
            <!-- Loading State -->
            <VideoSkeleton v-if="loading" />

            <!-- Content -->
            <div v-else-if="video" class="flex flex-col lg:flex-row gap-4">
                <VideoPlayer :video="video" class="lg:flex-1" />

                <div class="bg-white rounded-lg border border-gray-200 max-w-full lg:max-w-md w-full flex flex-col">
                    <div class="px-6 py-4">
                        <VideoEditForm v-if="isEditing" v-model:title="form.title"
                            v-model:description="form.description" @save="handleSave" @toggle-edit="toggleEdit" :saving="saving" />
                        <div v-else>
                            <VideoHeader :video="video" @reload="handleReload"
                            @toggle-edit="toggleEdit" @delete="handleDelete" />
                            <div class="mb-4">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Video Details</h3>
                                <div class="flex flex-col gap-2">
                                    <dl v-for="info in videoInfos" :key="info.label" class="space-y-2">
                                        <div>
                                            <dt class="text-sm font-medium text-gray-500">{{ info.label }}</dt>
                                            <dd class="text-sm text-gray-900">
                                                <div class="flex items-center space-x-2">
                                                    <input readonly
                                                        class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 font-mono"
                                                        :value="info.value || '-'">
                                                    <button v-if="info.value"
                                                        @click="copyToClipboard(info.value, info.label)"
                                                        class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors text-gray-700"
                                                        title="Copy value">
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                                                            </path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
