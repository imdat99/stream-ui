<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { fetchMockVideoById } from '@/mocks/videos';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    videoId: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const toast = useToast();
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const copiedField = ref<string | null>(null);

const fetchVideo = async () => {
    loading.value = true;
    try {
        const videoData = await fetchMockVideoById(props.videoId);
        if (videoData) {
            video.value = videoData;
        }
    } catch (error) {
        console.error('Failed to fetch video:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load video details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '');

const shareLinks = computed(() => {
    if (!video.value) return [];
    const v = video.value;
    return [
        {
            key: 'embed',
            label: 'Embed player (recommended)',
            value: `${baseUrl.value}/play/index/${v.id}`,
        },
        {
            key: 'thumbnail',
            label: 'Thumbnail URL',
            value: v.thumbnail || '',
        },
        {
            key: 'hls',
            label: 'HLS link (VIP only)',
            value: v.hls_path ? `${baseUrl.value}/hls/getlink/${v.id}/${v.hls_token}/${v.hls_path}` : '',
            placeholder: 'HLS link available for VIP with whitelisted domain',
            hint: 'This link redirects to a signed HLS URL and only works on whitelisted domains.',
        },
    ];
});

const copyToClipboard = async (text: string, key: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    copiedField.value = key;
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard', life: 2000 });
    setTimeout(() => {
        copiedField.value = null;
    }, 2000);
};

watch(() => props.videoId, (newId) => {
    if (newId) {
        fetchVideo();
    } else {
        video.value = null;
    }
}, { immediate: true });
</script>

<template>
    <Dialog :visible="!!videoId" @update:visible="emit('close')" modal dismissableMask
        :style="{ width: '600px', maxWidth: '90vw' }">
        <!-- Header -->
        <template #header>
            <div v-if="loading" class="flex items-center gap-3">
                <Skeleton width="12rem" height="1.25rem" />
            </div>
            <span v-else class="font-semibold text-lg">Get sharing address</span>
        </template>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="flex flex-col gap-5">
            <div>
                <Skeleton width="8rem" height="0.75rem" class="mb-3" />
                <div v-for="i in 3" :key="i" class="flex flex-col gap-1.5 mb-4">
                    <Skeleton width="40%" height="0.75rem" />
                    <div class="flex gap-2">
                        <Skeleton width="100%" height="2.25rem" borderRadius="6px" />
                        <Skeleton width="2.75rem" height="2.25rem" borderRadius="6px" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <Skeleton width="100%" height="4rem" borderRadius="6px" />
                <Skeleton width="100%" height="4rem" borderRadius="6px" />
            </div>
        </div>

        <!-- Content -->
        <div v-else class="flex flex-col gap-5">
            <!-- Player addresses -->
            <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Player address</p>
                <div class="flex flex-col gap-4">
                    <div v-for="link in shareLinks" :key="link.key" class="flex flex-col gap-1.5">
                        <p class="text-sm font-medium text-muted-foreground">{{ link.label }}</p>
                        <div class="flex gap-2">
                            <InputText :value="link.value || ''" :placeholder="link.placeholder" readonly
                                class="flex-1 !font-mono !text-xs" @click="($event.target as HTMLInputElement)?.select()" />
                            <Button severity="secondary" outlined :disabled="!link.value || copiedField === link.key"
                                @click="copyToClipboard(link.value, link.key)" class="shrink-0">
                                <!-- Copy icon -->
                                <svg v-if="copiedField !== link.key" xmlns="http://www.w3.org/2000/svg" width="16"
                                    height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                                <!-- Check icon -->
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </Button>
                        </div>
                        <p v-if="link.hint" class="text-xs text-muted-foreground">{{ link.hint }}</p>
                    </div>
                </div>
            </div>

            <!-- Notices -->
            <div class="flex flex-col gap-2 text-sm">
                <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-3">
                    
                    <div class="flex-1 text-sm">
                        <p class="font-medium text-red-900 dark:text-red-100 mb-1">Warning</p>
                        <p class="text-red-800 dark:text-red-200">Make sure shared files comply with <strong>local laws</strong> and confirm you understand the responsibilities involved when distributing content.</p>
                    </div>
                </div>
                <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-3">
                    
                    <div class="flex-1 text-sm">
                        <p class="font-medium text-amber-900 dark:text-amber-100 mb-1">Reminder</p>
                        <p class="text-amber-800 dark:text-amber-200">The embed player can auto switch fallback nodes and works well on mobile. Raw HLS links
                                rely on your own player and must be used only on whitelisted domains.</p>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>