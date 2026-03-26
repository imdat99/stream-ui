<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import type { Video as ModelVideo } from '@/server/api/proto/app/v1/common';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    videoId: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const toast = useAppToast();
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const copiedField = ref<string | null>(null);
const { t } = useTranslation();

const fetchVideo = async () => {
    loading.value = true;
    try {
        const response = await rpcClient.getVideo({ id: props.videoId });
        if (response.video) {
            video.value = response.video;
        }
    } catch (error) {
        console.error('Failed to fetch video:', error);
        toast.add({
            severity: 'error',
            summary: t('video.copyModal.toastErrorSummary'),
            detail: t('video.copyModal.toastErrorDetail'),
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '');

const shareLinks = computed(() => {
    if (!video.value) return [];
    const v = video.value;
    const playbackPath = v.url || '';
    const playbackUrl = playbackPath.startsWith('http') ? playbackPath : `${baseUrl.value}/${playbackPath.replace(/^\/+/, '')}`;
    return [
        {
            key: 'embed',
            label: t('video.copyModal.embedPlayer'),
            value: playbackUrl,
        },
        {
            key: 'thumbnail',
            label: t('video.copyModal.thumbnail'),
            value: v.thumbnail || '',
        },
        {
            key: 'hls',
            label: t('video.copyModal.hls'),
            value: playbackUrl,
            placeholder: t('video.copyModal.hlsPlaceholder'),
            hint: t('video.copyModal.hlsHint'),
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
    toast.add({
        severity: 'success',
        summary: t('video.copyModal.toastCopiedSummary'),
        detail: t('video.copyModal.toastCopiedDetail'),
        life: 2000
    });
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
    <AppDialog :visible="!!videoId" @update:visible="emit('close')" max-width-class="max-w-xl"
        :title="loading ? '' : t('video.copyModal.title')">

        <!-- Loading Skeleton -->
        <div v-if="loading" class="flex flex-col gap-5">
            <div>
                <div class="w-32 h-3 bg-gray-200 rounded animate-pulse mb-3" />
                <div v-for="i in 3" :key="i" class="flex flex-col gap-1.5 mb-4">
                    <div class="w-2/5 h-3 bg-gray-200 rounded animate-pulse" />
                    <div class="flex gap-2">
                        <div class="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
                        <div class="w-11 h-9 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <div class="w-full h-16 bg-gray-200 rounded-md animate-pulse" />
                <div class="w-full h-16 bg-gray-200 rounded-md animate-pulse" />
            </div>
        </div>

        <!-- Content -->
        <div v-else class="flex flex-col gap-5">
            <!-- Player addresses -->
            <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{{ t('video.copyModal.playerAddress') }}</p>
                <div class="flex flex-col gap-4">
                    <div v-for="link in shareLinks" :key="link.key" class="flex flex-col gap-1.5">
                        <p class="text-sm font-medium text-muted-foreground">{{ link.label }}</p>
                        <div class="flex gap-2">
                            <AppInput :model-value="link.value || ''" :placeholder="link.placeholder" readonly
                                input-class="!font-mono !text-xs" wrapperClass="w-full" @click="($event.target as HTMLInputElement)?.select()" />
                            <AppButton variant="secondary" :disabled="!link.value || copiedField === link.key"
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
                            </AppButton>
                        </div>
                        <p v-if="link.hint" class="text-xs text-muted-foreground">{{ link.hint }}</p>
                    </div>
                </div>
            </div>

            <!-- Notices -->
            <div class="flex flex-col gap-2 text-sm">
                <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-3">
                    <div class="flex-1 text-sm">
                        <p class="font-medium text-red-900 dark:text-red-100 mb-1">{{ t('video.copyModal.warningTitle') }}</p>
                        <p class="text-red-800 dark:text-red-200">{{ t('video.copyModal.warningDetail') }}</p>
                    </div>
                </div>
                <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-3">
                    <div class="flex-1 text-sm">
                        <p class="font-medium text-amber-900 dark:text-amber-100 mb-1">{{ t('video.copyModal.reminderTitle') }}</p>
                        <p class="text-amber-800 dark:text-amber-200">{{ t('video.copyModal.reminderDetail') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </AppDialog>
</template>
