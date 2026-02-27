<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { fetchMockVideoById, updateMockVideo } from '@/mocks/videos';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{
    videoId: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const toast = useToast();
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const saving = ref(false);

const initialValues = ref({
    title: '',
    description: '',
});

const resolver = zodResolver(
    z.object({
        title: z.string().min(1, { message: 'Title is required.' }),
        description: z.string().optional(),
    })
);

const subtitleForm = ref({
    file: null as File | null,
    language: 'en',
    displayName: '',
});

const fetchVideo = async () => {
    loading.value = true;
    try {
        const videoData = await fetchMockVideoById(props.videoId);
        if (videoData) {
            video.value = videoData;
            initialValues.value = {
                title: videoData.title || '',
                description: videoData.description || '',
            };
        }
    } catch (error) {
        console.error('Failed to fetch video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load video details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
    if (!valid) return;
    saving.value = true;
    try {
        const payload = { title: values.title as string, description: values.description as string };
        await updateMockVideo(props.videoId, payload);

        if (video.value) {
            video.value.title = payload.title;
            video.value.description = payload.description;
        }

        toast.add({ severity: 'success', summary: 'Success', detail: 'Video updated successfully', life: 3000 });
        close();
    } catch (error) {
        console.error('Failed to save video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save changes', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const onSubtitleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    subtitleForm.value.file = target.files?.[0] || null;
};

const canUploadSubtitle = computed(() => {
    return subtitleForm.value.file && subtitleForm.value.language.trim();
});

const handleUploadSubtitle = () => {
    if (!canUploadSubtitle.value) return;
    toast.add({ severity: 'info', summary: 'Info', detail: 'Subtitle upload not yet implemented', life: 3000 });
};

watch(() => props.videoId, (newId) => {
    if (newId) {
        fetchVideo();
    }
}, { immediate: true });
</script>

<template>
    <Dialog :visible="!!videoId" @update:visible="emit('close')" modal dismissableMask
        :style="{ width: '600px', maxWidth: '90vw' }">
        <!-- Header -->
        <template #header>
            <div v-if="loading" class="flex items-center gap-3">
                <Skeleton width="8rem" height="1.25rem" />
            </div>
            <span v-else class="font-semibold text-lg">Edit video</span>
        </template>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="flex flex-col gap-4">
            <!-- Title skeleton -->
            <div class="flex flex-col gap-2">
                <Skeleton width="3rem" height="0.875rem" />
                <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
            </div>
            <!-- Description skeleton -->
            <div class="flex flex-col gap-2">
                <Skeleton width="5rem" height="0.875rem" />
                <Skeleton width="100%" height="6rem" borderRadius="6px" />
            </div>
            <!-- Subtitles section skeleton -->
            <div class="flex flex-col gap-3 border-t border-surface pt-4">
                <div class="flex items-center justify-between">
                    <Skeleton width="4rem" height="0.875rem" />
                    <Skeleton width="4.5rem" height="1.5rem" borderRadius="16px" />
                </div>
                <Skeleton width="60%" height="0.875rem" />
                <div class="flex flex-col gap-3 rounded-lg border border-surface p-3">
                    <Skeleton width="6rem" height="0.875rem" />
                    <Skeleton width="100%" height="2.25rem" borderRadius="6px" />
                    <div class="grid grid-cols-2 gap-3">
                        <Skeleton width="100%" height="2.25rem" borderRadius="6px" />
                        <Skeleton width="100%" height="2.25rem" borderRadius="6px" />
                    </div>
                    <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
                </div>
            </div>
        </div>

        <!-- Form Content -->
        <Form v-else v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
            class="flex flex-col gap-4">
            <!-- Title -->
            <div class="flex flex-col gap-1">
                <label for="edit-title" class="text-sm font-medium">Title</label>
                <InputText id="edit-title" name="title" placeholder="Enter video title" fluid />
                <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.title.error?.message }}
                </Message>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1">
                <label for="edit-description" class="text-sm font-medium">Description</label>
                <Textarea id="edit-description" name="description" placeholder="Enter video description"
                    :rows="4" autoResize fluid />
                <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
                    {{ $form.description.error?.message }}
                </Message>
            </div>

            <!-- Subtitles Section -->
            <div class="flex flex-col gap-3 border-t-2 border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-medium">Subtitles</label>
                    <Tag value="0 tracks" severity="secondary" />
                </div>
                <p class="text-sm text-muted-foreground">No subtitles uploaded yet</p>

                <!-- Upload Subtitle Form -->
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
                    <label class="text-sm font-medium">Upload Subtitle</label>

                    <div class="flex flex-col gap-1">
                        <label for="subtitle-file" class="text-xs font-medium">
                            Subtitle File (VTT, SRT, ASS, SSA)
                        </label>
                        <input id="subtitle-file" type="file"
                            accept=".vtt,.srt,.ass,.ssa,text/vtt,text/srt,application/x-subrip"
                            class="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            @change="onSubtitleFileChange" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <label for="subtitle-language" class="text-xs font-medium">Language Code *</label>
                            <InputText id="subtitle-language" v-model="subtitleForm.language" placeholder="en, vi, etc."
                                :maxlength="10" size="small" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="subtitle-name" class="text-xs font-medium">Display Name (Optional)</label>
                            <InputText id="subtitle-name" v-model="subtitleForm.displayName"
                                placeholder="English, Tiếng Việt, etc." size="small" />
                        </div>
                    </div>

                    <Button label="Upload Subtitle" icon="i-carbon-upload" severity="secondary" outlined
                        class="w-full" :disabled="!canUploadSubtitle" @click="handleUploadSubtitle" />
                </div>
            </div>

            <!-- Footer inside Form so submit works -->
            <div class="flex justify-end gap-2 border-t border-surface pt-4">
                <Button label="Cancel" type="button" text severity="secondary" @click="emit('close')" />
                <Button label="Save Changes" type="submit" icon="i-carbon-checkmark" :loading="saving" />
            </div>
        </Form>

        <!-- Footer skeleton when loading -->
        <template v-if="loading" #footer>
            <div class="flex justify-end gap-2">
                <Skeleton width="5rem" height="2.5rem" borderRadius="6px" />
                <Skeleton width="8rem" height="2.5rem" borderRadius="6px" />
            </div>
        </template>
    </Dialog>
</template>