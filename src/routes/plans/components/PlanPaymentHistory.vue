<script setup lang="ts">
import { Tag } from '@/components/ui/form';
import { inject } from 'vue';

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

const getStatusSeverity = (status: string): 'success' | 'error' | 'warn' | 'info' | 'secondary' => {
    switch (status) {
        case 'success':
            return 'success';
        case 'failed':
            return 'error';
        case 'pending':
            return 'warn';
        default:
            return 'info';
    }
};

const toast = inject<{ add: (t: any) => void }>('toast');

const downloadInvoice = (item: PaymentHistoryItem) => {
    toast?.add({
        severity: 'info',
        summary: 'Downloading',
        detail: `Downloading invoice #${item.invoiceId}...`,
        life: 2000
    });

    setTimeout(() => {
        toast?.add({
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
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in history" :key="item.id">
                            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ item.date }}</td>
                            <td class="px-4 py-3 text-sm text-gray-900">${{ item.amount }}</td>
                            <td class="px-4 py-3 text-sm text-gray-500">{{ item.plan }}</td>
                            <td class="px-4 py-3">
                                <Tag :value="item.status" :severity="getStatusSeverity(item.status)" />
                            </td>
                        </tr>
                        <tr v-if="history.length === 0">
                            <td colspan="4" class="px-4 py-8 text-center text-gray-500">No payment history found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>
