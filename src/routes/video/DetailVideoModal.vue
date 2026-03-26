<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import type { AdTemplate as ManualAdTemplate, Video as ModelVideo } from '@/server/api/proto/app/v1/common';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/stores/auth';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    videoId: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const toast = useAppToast();
const auth = useAuthStore();
const video = ref<ModelVideo | null>(null);
const loading = ref(true);
const saving = ref(false);
const { t } = useTranslation();

type AdConfigPayload = {
    ad_template_id: string;
    template_name?: string;
    vast_tag_url?: string;
    ad_format?: string;
    duration?: number;
};

const form = ref({
    title: '',
    adTemplateId: '' as string,
});

const currentAdConfig = ref<AdConfigPayload | null>(null);
const adTemplates = ref<ManualAdTemplate[]>([]);
const loadingTemplates = ref(false);

const errors = ref<{ title?: string }>({});
const isFreePlan = computed(() => !auth.user?.plan_id);

const activeTemplates = computed(() =>
    adTemplates.value.filter(t => t.isActive),
);

const subtitleForm = ref({
    file: null as File | null,
    language: 'en',
    displayName: '',
});

const fetchAdTemplates = async () => {
    loadingTemplates.value = true;
    try {
        const response = await rpcClient.listAdTemplates();
        adTemplates.value = response.templates ?? [];
    } catch (error) {
        console.error('Failed to fetch ad templates:', error);
    } finally {
        loadingTemplates.value = false;
    }
};

const fetchVideo = async () => {
    loading.value = true;
    try {
        const response = await rpcClient.getVideo({ id: props.videoId });
        const videoData = response.video;

        if (videoData) {
            video.value = videoData;
            currentAdConfig.value = null;
            form.value = {
                title: videoData.title || '',
                adTemplateId: '',
            };
        }
    } catch (error) {
        console.error('Failed to fetch video:', error);
        toast.add({
            severity: 'error',
            summary: t('video.detailModal.toast.loadErrorSummary'),
            detail: t('video.detailModal.toast.loadErrorDetail'),
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const validate = (): boolean => {
    errors.value = {};
    if (!form.value.title.trim()) {
        errors.value.title = t('video.detailModal.errors.titleRequired');
    }
    return Object.keys(errors.value).length === 0;
};

const onFormSubmit = async () => {
    if (!validate()) return;
    saving.value = true;
    try {
        const response = await rpcClient.updateVideo({
            id: props.videoId,
            title: form.value.title,
            description: video.value?.description || '',
            url: video.value?.url,
            size: video.value?.size,
            duration: video.value?.duration,
            format: video.value?.format,
            status: video.value?.status,
        });

        const updatedVideo = response.video as ModelVideo | undefined;

        if (updatedVideo) {
            video.value = updatedVideo;
            currentAdConfig.value = null;
            form.value = {
                title: updatedVideo.title || '',
                adTemplateId: '',
            };
        }

        toast.add({
            severity: 'success',
            summary: t('video.detailModal.toast.saveSuccessSummary'),
            detail: t('video.detailModal.toast.saveSuccessDetail'),
            life: 3000
        });
        emit('close');
    } catch (error) {
        console.error('Failed to save video:', error);
        toast.add({
            severity: 'error',
            summary: t('video.detailModal.toast.saveErrorSummary'),
            detail: t('video.detailModal.toast.saveErrorDetail'),
            life: 3000
        });
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
    toast.add({
        severity: 'info',
        summary: t('video.detailModal.toast.subtitleInfoSummary'),
        detail: t('video.detailModal.toast.subtitleInfoDetail'),
        life: 3000
    });
};

watch(() => props.videoId, (newId) => {
    if (newId) {
        errors.value = {};
        fetchVideo();
        fetchAdTemplates();
    }
}, { immediate: true });
</script>

<template>
    <AppDialog :visible="!!videoId" @update:visible="emit('close')" max-width-class="max-w-xl"
        :title="loading ? '' : $t('video.detailModal.title')">

        <!-- Loading Skeleton -->
        <div v-if="loading" class="flex flex-col gap-4">
            <!-- Title skeleton -->
            <div class="flex flex-col gap-2">
                <div class="w-12 h-3.5 bg-gray-200 rounded animate-pulse" />
                <div class="w-full h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <!-- ad-template selector skeleton -->
            <div class="flex flex-col gap-2">
                <div class="w-24 h-3.5 bg-gray-200 rounded animate-pulse" />
                <div class="w-full h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <!-- Subtitles section skeleton -->
            <div class="flex flex-col gap-3 border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                    <div class="w-16 h-3.5 bg-gray-200 rounded animate-pulse" />
                    <div class="w-[4.5rem] h-6 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div class="w-3/5 h-3.5 bg-gray-200 rounded animate-pulse" />
                <div class="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
                    <div class="w-24 h-3.5 bg-gray-200 rounded animate-pulse" />
                    <div class="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
                    <div class="grid grid-cols-2 gap-3">
                        <div class="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
                        <div class="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                    <div class="w-full h-10 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>
            <!-- Footer skeleton -->
            <div class="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <div class="w-20 h-10 bg-gray-200 rounded-md animate-pulse" />
                <div class="w-32 h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>
        </div>

        <!-- Form Content -->
        <form v-else @submit.prevent="onFormSubmit" class="flex flex-col gap-4">
            <!-- Title -->
            <div class="flex flex-col gap-1">
                <label for="edit-title" class="text-sm font-medium">{{ t('video.detailModal.titleLabel') }}</label>
                <AppInput id="edit-title" v-model="form.title" :placeholder="t('video.detailModal.titlePlaceholder')" />
                <p v-if="errors.title" class="text-xs text-red-500 mt-0.5">{{ errors.title }}</p>
            </div>

            <!-- Ad Template Selector -->
            <div class="flex flex-col gap-1">
                <label for="edit-ad-template" class="text-sm font-medium">{{ t('video.detailModal.adTemplateLabel') }}</label>
                <select
                    id="edit-ad-template"
                    v-model="form.adTemplateId"
                    :disabled="isFreePlan || saving"
                    class="w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    :class="isFreePlan
                        ? 'border-border bg-muted/50 text-foreground/50 cursor-not-allowed'
                        : 'border-border bg-background text-foreground cursor-pointer hover:border-primary/50'"
                >
                    <option value="">{{ t('video.detailModal.adTemplateNone') }}</option>
                    <option
                        v-for="tmpl in activeTemplates"
                        :key="tmpl.id"
                        :value="tmpl.id"
                    >
                        {{ tmpl.name }}{{ tmpl.isDefault ? ` (${t('video.detailModal.adTemplateDefault')})` : '' }}
                    </option>
                </select>
                <p v-if="isFreePlan" class="text-xs text-foreground/50 mt-0.5">
                    {{ t('video.detailModal.adTemplateUpgradeHint') }}
                </p>
                <p v-else-if="!form.adTemplateId" class="text-xs text-foreground/50 mt-0.5">
                    {{ t('video.detailModal.adTemplateNoAdsHint') }}
                </p>
            </div>

            <!-- Subtitles Section -->
            <div class="flex flex-col gap-3 border-t-2 border-border pt-4">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-medium">{{ t('video.detailModal.subtitlesTitle') }}</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground/70">
                        {{ t('video.detailModal.subtitleTracks', { count: 0 }) }}
                    </span>
                </div>
                <p class="text-sm text-muted-foreground">{{ t('video.detailModal.noSubtitles') }}</p>

                <!-- Upload Subtitle Form -->
                <div class="flex flex-col gap-3 rounded-lg border border-border p-3">
                    <label class="text-sm font-medium">{{ t('video.detailModal.uploadSubtitle') }}</label>

                    <div class="flex flex-col gap-1">
                        <label for="subtitle-file" class="text-xs font-medium">
                            {{ t('video.detailModal.subtitleFile') }}
                        </label>
                        <input id="subtitle-file" type="file"
                            accept=".vtt,.srt,.ass,.ssa,text/vtt,text/srt,application/x-subrip"
                            class="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            @change="onSubtitleFileChange" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex flex-col gap-1">
                            <label for="subtitle-language" class="text-xs font-medium">{{ t('video.detailModal.languageCode') }}</label>
                            <AppInput id="subtitle-language" v-model="subtitleForm.language" :placeholder="t('video.detailModal.languagePlaceholder')"
                                :maxlength="10" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <label for="subtitle-name" class="text-xs font-medium">{{ t('video.detailModal.displayName') }}</label>
                            <AppInput id="subtitle-name" v-model="subtitleForm.displayName"
                                :placeholder="t('video.detailModal.displayNamePlaceholder')" />
                        </div>
                    </div>

                    <AppButton variant="secondary" class="w-full" :disabled="!canUploadSubtitle" @click="handleUploadSubtitle">
                        {{ t('video.detailModal.uploadSubtitleButton') }}
                    </AppButton>
                </div>
            </div>

            <!-- Footer inside Form so submit works -->
            <div class="flex justify-end gap-2 border-t border-border pt-4">
                <AppButton variant="ghost" type="button" @click="emit('close')">{{ t('video.detailModal.cancel') }}</AppButton>
                <AppButton type="submit" :loading="saving">{{ t('video.detailModal.saveChanges') }}</AppButton>
            </div>
        </form>
    </AppDialog>
</template>
