<script setup lang="ts">
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    searchQuery: string;
    selectedStatus: string;
    statusOptions: { label: string; value: string }[];
    total: number;
    page: number; // 1-based index
    limit: number;
    loading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:searchQuery', value: string): void;
    (e: 'update:selectedStatus', value: string): void;
    (e: 'update:page', value: number): void;
    (e: 'update:limit', value: number): void;
    (e: 'search'): void;
}>();

const { t } = useTranslation();
const pageCount = computed(() => Math.ceil(props.total / props.limit) || 1);
const first = computed(() => Math.min((props.page - 1) * props.limit + 1, props.total));
const last = computed(() => Math.min(props.page * props.limit, props.total));

const prevPage = () => {
    if (props.page > 1) emit('update:page', props.page - 1);
};

const nextPage = () => {
    if (props.page < pageCount.value) emit('update:page', props.page + 1);
};
</script>

<template>
    <div class="border-b border-gray-200 mb-6">
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <!-- Search -->
            <AppInput :model-value="searchQuery" @update:model-value="emit('update:searchQuery', $event as string)"
                @enter="emit('search')" :placeholder="t('video.filters.searchPlaceholder')" class="flex-1">
                <template #prefix>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </template>
            </AppInput>

            <!-- Status Filter -->
            <select :value="selectedStatus" @change="emit('update:selectedStatus', ($event.target as HTMLSelectElement).value)"
                class="w-full md:w-44 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
        </div>

        <!-- Paginator -->
        <div class="flex justify-end w-full gap-2 mt-3 mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ t('video.filters.rangeOfTotal', { first, last, total }) }}
            </span>
            <div class="flex items-center gap-1">
                <button class="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="prevPage" :disabled="page <= 1" :aria-label="t('video.filters.previousPageAria')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <button class="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    @click="nextPage" :disabled="page >= pageCount" :aria-label="t('video.filters.nextPageAria')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
