<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';
import Chart from '@/components/icons/Chart.vue';
import Credit from '@/components/icons/Credit.vue';
import Upload from '@/components/icons/Upload.vue';
import Video from '@/components/icons/Video.vue';
import { useUIState } from '@/stores/uiState';
import { useRouter } from 'vue-router';
import Referral from './Referral.vue';

interface Props {
    loading: boolean;
}

defineProps<Props>();

const uiState = useUIState();
const router = useRouter();
const { t } = useTranslation();

const quickActions = computed(() => [
    {
        title: t('overview.quickActions.uploadVideo.title'),
        description: t('overview.quickActions.uploadVideo.description'),
        icon: Upload,
        onClick: () => uiState.toggleUploadDialog()
    },
    {
        title: t('overview.quickActions.videoLibrary.title'),
        description: t('overview.quickActions.videoLibrary.description'),
        icon: Video,
        onClick: () => router.push('/videos')
    },
    {
        title: t('overview.quickActions.analytics.title'),
        description: t('overview.quickActions.analytics.description'),
        icon: Chart,
        onClick: () => { }
    },
    {
        title: t('overview.quickActions.managePlan.title'),
        description: t('overview.quickActions.managePlan.description'),
        icon: Credit,
        onClick: () => router.push('/settings/billing')
    },
]);
</script>

<template>
    <div v-if="loading" class="mb-8">
        <div class="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="i in 4" :key="i" class="p-6 rounded-xl border border-gray-200">
                    <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse mb-4" />
                    <div class="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2" />
                    <div class="w-full h-4 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div class="flex flex-col justify-between p-6 rounded-xl border border-gray-200">
                <div class="w-40 h-8 bg-gray-200 rounded animate-pulse" />
                <div class="w-full h-5 bg-gray-200 rounded animate-pulse my-4" />
                <div class="w-full h-4 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>

    <div v-else class="mb-8">
        <h2 class="text-xl font-semibold mb-4">{{ t('overview.quickActions.title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button v-for="action in quickActions" :key="action.title" @click="action.onClick" :class="[
                    'p-6 rounded-xl text-left transition-all duration-200 flex flex-col bg-surface',
                    'border border-gray-300 hover:border-primary hover:shadow-lg',
                    'group press-animated',
                ]">
                    <div
                        class="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-muted group-hover:bg-primary/10">
                        <component filled :is="action.icon" class="w-6 h-6" />
                    </div>
                    <h3 class="font-semibold mb-1 group-hover:text-primary transition-colors">{{ action.title }}</h3>
                    <p class="text-sm text-gray-600">{{ action.description }}</p>
                </button>
            </div>
            <Referral />
        </div>
    </div>
</template>
