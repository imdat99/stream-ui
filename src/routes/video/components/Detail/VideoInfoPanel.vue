<script setup lang="ts">
import type { ModelVideo } from '@/api/client';
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    video: ModelVideo;
}>();

const emit = defineEmits<{
    copy: [text: string, label: string];
}>();

const { t } = useTranslation();

const handleCopy = (text: string, label: string) => {
    emit('copy', text, label);
};
const origin = computed(() => typeof window !== 'undefined' ? window.location.origin : '');

const videoInfos = computed(() => {
    if (!props.video) return [];
    const embedUrl = `${origin.value}/embed/${props.video.id}`;

    return [
        { label: t('video.detailPage.videoInfo.videoId'), value: props.video.id },
        { label: t('video.detailPage.videoInfo.thumbnailUrl'), value: props.video.thumbnail },
        { label: t('video.detailPage.videoInfo.embedUrl'), value: embedUrl },
        { label: t('video.detailPage.videoInfo.iframeCode'), value: embedUrl ? `<iframe src="${embedUrl}" title="${props.video.title}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>` : '' },
        { label: t('video.detailPage.videoInfo.shareLink'), value: `${origin.value}/view/${props.video.id}` },
    ];
});
</script>

<template>
    <div class="">
        <div class="mb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('video.detailPage.detailsTitle') }}</h3>
            <div class="flex flex-col gap-2">
                <dl v-for="info in videoInfos" :key="info.label" class="space-y-2">
                    <div>
                        <dt class="text-sm font-medium text-gray-500">{{ info.label }}</dt>
                        <dd class="text-sm text-gray-900">
                            <div class="flex items-center space-x-2">
                                <input readonly
                                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 font-mono"
                                    :value="info.value || '-'">
                                <button v-if="info.value" @click="handleCopy(info.value, info.label)"
                                    class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors text-gray-700"
                                    :title="t('video.detailPage.copyValueTitle')">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
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
</template>
