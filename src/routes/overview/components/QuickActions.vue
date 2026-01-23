<script setup lang="ts">
import Chart from '@/components/icons/Chart.vue';
import Credit from '@/components/icons/Credit.vue';
import Upload from '@/components/icons/Upload.vue';
import Video from '@/components/icons/Video.vue';
import Skeleton from 'primevue/skeleton';
import { useRouter } from 'vue-router';
import Referral from './Referral.vue';

interface Props {
    loading: boolean;
}

defineProps<Props>();

const router = useRouter();

const quickActions = [
    {
        title: 'Upload Video',
        description: 'Upload a new video to your library',
        icon: Upload,
        onClick: () => router.push('/upload')
    },
    {
        title: 'Video Library',
        description: 'Browse all your videos',
        icon: Video,
        onClick: () => router.push('/video')
    },
    {
        title: 'Analytics',
        description: 'Track performance & insights',
        icon: Chart,
        onClick: () => { }
    },
    {
        title: 'Manage Plan',
        description: 'Upgrade or change your plan',
        icon: Credit,
        onClick: () => router.push('/payments-and-plans')
    },
];
</script>

<template>
    <div v-if="loading" class="mb-8">
        <Skeleton width="10rem" height="1.5rem" class="mb-4"></Skeleton>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="p-6 rounded-xl border border-gray-200">
                <Skeleton shape="circle" size="3rem" class="mb-4"></Skeleton>
                <Skeleton width="8rem" height="1.25rem" class="mb-2"></Skeleton>
                <Skeleton width="100%" height="1rem"></Skeleton>
            </div>
        </div>
    </div>

    <div v-else class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button v-for="action in quickActions" :key="action.title" @click="action.onClick" :class="[
                    'p-6 rounded-xl text-left transition-all duration-200 flex flex-col',
                    'border border-gray-300 hover:border-primary hover:shadow-lg',
                    'group press-animated',

                ]">
                    <div
                        :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gray-100 group-hover:bg-primary/10']">
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
