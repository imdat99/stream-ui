<script setup lang="ts">
defineProps<{
    searchQuery: string;
    selectedStatus: string;
    viewMode: 'grid' | 'table';
    statusOptions: { label: string; value: string }[];
    total: number;
    page: number; // 1-based index
    limit: number;
    loading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:searchQuery', value: string): void;
    (e: 'update:selectedStatus', value: string): void;
    (e: 'update:viewMode', value: 'grid' | 'table'): void;
    (e: 'update:page', value: number): void;
    (e: 'update:limit', value: number): void;
    (e: 'search'): void;
}>();
</script>

<template>
    <div class="border-b border-gray-200 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 bg-white rounded-lg">
                <div class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        viewBox="-10 -258 534 534">
                        <path
                            d="M384-40c0-97-79-176-176-176S32-137 32-40s79 176 176 176S384 57 384-40zm-41 158c-36 31-83 50-135 50C93 168 0 75 0-40s93-208 208-208 208 93 208 208c0 52-19 99-50 135l141 142c7 6 7 16 0 22-6 7-16 7-22 0L343 118z"
                            fill="#1e3050" />
                    </svg>
                    <input :value="searchQuery"
                        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                        @keyup.enter="emit('search')" type="text" placeholder="Search videos by title or description..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
            </div>

            <!-- Status Filter -->
            <FloatLabel class="w-full md:w-56" variant="on">
                <Select :modelValue="selectedStatus" @update:modelValue="emit('update:selectedStatus', $event)"
                    inputId="on_label" :options="statusOptions" optionLabel="label" optionValue="value"
                    class="w-full" />
                <label for="on_label">Status</label>
            </FloatLabel>

            <!-- View Mode Toggle -->
            <div class="flex items-center gap-2 bg-slate-200 rounded-lg p-1">
                <button @click="emit('update:viewMode', 'table')" :class="[
                    'px-3 py-1.5 rounded transition-colors',
                    viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                ]" title="Table view">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
                        :class="viewMode === 'table' ? 'text-primary' : 'text-gray-600'" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </button>
                <button @click="emit('update:viewMode', 'grid')" :class="[
                    'px-3 py-1.5 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                ]" title="Grid view">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
                        :class="viewMode === 'grid' ? 'text-primary' : 'text-gray-600'" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z" />
                    </svg>
                </button>
            </div>
        </div>
        <Paginator :pt="{
            root: '!bg-transparent !p-0 !justify-end !mt-2'
        }" :rows="limit" :totalRecords="total" :first="(page - 1) * limit" :rowsPerPageOptions="[10, 20, 30]"
            @page="(e) => { emit('update:page', e.page + 1); emit('update:limit', e.rows); }">
            <template #container="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
                <div class="flex items-center gap-2 bg-transparent px-2 justify-between sm:w-auto">
                    <div class="text-sm text-gray-500">
                        <span class="hidden sm:block">{{ first }} - {{ last }} of {{ totalRecords }} results</span>
                        <span class="block sm:hidden">Page {{ page + 1 }} of {{ pageCount }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <Button rounded variant="text" @click="prevPageCallback" :disabled="page === 0"
                            title="previous">
                            <!-- <span class="i-heroicons-chevron-left w-5 h-5" /> -->
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Button>
                        <Button rounded variant="text" @click="nextPageCallback" :disabled="page === pageCount! - 1"
                            title="next">
                            <!-- <span class="i-heroicons-chevron-right w-5 h-5" /> -->
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </template>
        </Paginator>
    </div>
</template>
