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
import { useToast } from 'primevue/usetoast';
import ArrowDownTray from '@/components/icons/ArrowDownTray.vue';

const toast = useToast();



const downloadInvoice = (item: PaymentHistoryItem) => {
    toast.add({
        severity: 'info',
        summary: 'Downloading',
        detail: `Downloading invoice #${item.invoiceId}...`,
        life: 2000
    });

    // Simulate download delay
    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: 'Downloaded',
            detail: `Invoice #${item.invoiceId} downloaded successfully`,
            life: 3000
        });
    }, 1500);
};
</script>

<template>
    <section>
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Billing History</h2>
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <DataTable :value="history" responsiveLayout="scroll" class="w-full">
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
                        <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)"
                            class="capitalize px-2 py-0.5 text-xs" :rounded="true" />
                    </template>
                </Column>
                <!-- <Column header="" style="width: 3rem">
                    <template #body="slotProps">
                        <Button text rounded severity="secondary" size="small" @click="downloadInvoice(slotProps.data)"
                            v-tooltip="'Download Invoice'">
                            <template #icon>
                                <ArrowDownTray class="w-5 h-5" />
                            </template>
                        </Button>
                    </template>
                </Column> -->
            </DataTable>
        </div>
    </section>
</template>
