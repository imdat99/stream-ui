<script setup lang="ts">
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';

interface PaymentHistoryItem {
    id: string;
    date: string;
    amount: number;
    plan: string;
    status: string;
    invoiceId: string;
}

defineProps<{
    history: PaymentHistoryItem[];
}>();

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'success':
            return 'success';
        case 'failed':
            return 'danger';
        case 'pending':
            return 'warn';
        default:
            return 'info';
    }
};
</script>

<template>
    <section>
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Billing History</h2>
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <DataTable :value="history" tableStyle="min-width: 50rem"
            :pt="{
                thead: { class: 'bg-gray-50 border-b border-gray-200' },
                headerRow: { class: 'text-gray-500 text-xs font-semibold uppercase tracking-wider' },
                bodyRow: { class: 'text-gray-700 hover:bg-gray-50/50' }
            }"
            >
            <template #empty>
                <div class="text-center py-8 text-gray-500">No payment history found.</div>
            </template>
            <Column field="date" header="Date" class="font-medium"></Column>
            <Column field="amount" header="Amount">
                <template #body="slotProps">
                    ${{ slotProps.data.amount }}
                </template>
            </Column>
            <Column field="plan" header="Plan"></Column>
            <Column field="status" header="Status">
                    <template #body="slotProps">
                    <Tag 
                        :value="slotProps.data.status" 
                        :severity="getStatusSeverity(slotProps.data.status)" 
                        class="capitalize px-2 py-0.5 text-xs" 
                        :rounded="true"
                    />
                </template>
            </Column>
            <Column header="" style="width: 3rem">
                    <template #body>
                    <Button icon="i-heroicons-arrow-down-tray" text rounded severity="secondary" size="small" />
                    </template>
            </Column>
            </DataTable>
        </div>
    </section>
</template>
