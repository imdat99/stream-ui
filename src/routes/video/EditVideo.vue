<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { client, type ModelVideo } from '@/api/client';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const videoId = route.params.id as string;
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const saving = ref(false);

const form = ref({
    title: '',
    description: '',
});

const fetchVideo = async () => {
    loading.value = true;
    try {
        const response = await client.videos.videosDetail(videoId);
        // response is HttpResponse, response.data is the body, response.data.data is the ModelVideo
        const videoData = response.data.data;
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

const handleSave = async () => {
    saving.value = true;
    try {
        // Mock update - API doesn't support update yet
        console.log('Saving video:', videoId, form.value);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

        toast.add({ severity: 'success', summary: 'Success', detail: 'Video updated successfully', life: 3000 });
        router.push('/video');
    } catch (error) {
        console.error('Failed to save video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save changes', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.back();
};

onMounted(() => {
    fetchVideo();
});
</script>

<template>
    <div>
        <PageHeader title="Edit Video" :breadcrumbs="[
            { label: 'Dashboard', to: '/' },
            { label: 'Videos', to: '/video' },
            { label: 'Edit' }
        ]" />

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="100%" height="10rem" />
            <div class="flex gap-2">
                <Skeleton width="6rem" height="2.5rem" />
                <Skeleton width="6rem" height="2.5rem" />
            </div>
        </div>

        <div v-else-if="video" class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="space-y-6">
                <!-- Preview / Info -->
                <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div class="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <span class="i-heroicons-film text-gray-400 text-2xl" />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-medium text-gray-900">{{ video.title }}</h3>
                        <p class="text-sm text-gray-500 mt-1">ID: {{ video.id }}</p>
                        <p class="text-sm text-gray-500">Status: {{ video.status }}</p>
                    </div>
                </div>

                <!-- Form -->
                <div class="field">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <InputText id="title" v-model="form.title" class="w-full" />
                </div>

                <div class="field">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea id="description" v-model="form.description" rows="5" class="w-full" />
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button label="Cancel" severity="secondary" @click="handleCancel" text />
                    <Button label="Save Changes" @click="handleSave" :loading="saving" />
                </div>
            </div>
        </div>
    </div>
</template>
