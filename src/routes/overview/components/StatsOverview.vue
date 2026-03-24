<script setup lang="ts">
import StatsCard, { type StatProps } from '@/components/dashboard/StatsCard.vue';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';

interface Props {
    loading: boolean;
    stats: StatProps[]
}

const props = defineProps<Props>();
const { t, i18next } = useTranslation();
const localeTag = computed(() => i18next.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US');
</script>

<template>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="i in stats.length" :key="i" class="bg-header rounded-xl border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="space-y-2">
                    <div class="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div class="w-32 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div class="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard v-for="stat in stats" :key="stat.title" v-bind="stat"/>
    </div>
</template>
