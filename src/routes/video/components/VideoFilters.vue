<script setup lang="ts">
import { getStatusSeverity } from '@/lib/utils';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

defineProps<{
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
</script>

<template>
    <div class="border-b border-gray-200 mb-6">
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <!-- Search -->
            <IconField class="flex-1">
                <InputIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </InputIcon>
                <InputText :modelValue="searchQuery"
                    @update:modelValue="emit('update:searchQuery', $event as string)"
                    @keyup.enter="emit('search')" placeholder="Search videos..." fluid />
            </IconField>

            <!-- Status Filter -->
            <Select :modelValue="selectedStatus" @update:modelValue="emit('update:selectedStatus', $event)"
                :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Status"
                class="w-full md:w-44">
                <template #option="slotProps">
                    <Tag :value="slotProps.option.label" :severity="getStatusSeverity(slotProps.option.value)"
                        class="capitalize" />
                </template>
            </Select>
        </div>

        <!-- Paginator -->
        <Paginator :pt="{ root: '!bg-transparent !p-0 !justify-end !mt-3 !mb-2' }" :rows="limit" :totalRecords="total"
            :first="(page - 1) * limit" :rowsPerPageOptions="[10, 20, 30]"
            @page="(e) => { emit('update:page', e.page + 1); emit('update:limit', e.rows); }">
            <template #container="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
                <div class="flex justify-end w-full gap-2">
                    <Tag severity="secondary" size="small" rounded>
                        {{ first }}&ndash;{{ last }} of {{ totalRecords }}
                    </Tag>
                    <div class="flex items-center gap-1">
                        <Button rounded variant="text" size="small"
                            @click="prevPageCallback" :disabled="page === 0" aria-label="Previous page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </Button>
                        <Button rounded variant="text" size="small"
                            @click="nextPageCallback" :disabled="page === pageCount! - 1" aria-label="Next page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </Button>
                    </div>
                </div>
            </template>
        </Paginator>
    </div>
</template>
