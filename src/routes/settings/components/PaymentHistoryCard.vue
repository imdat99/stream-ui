<script setup lang="ts">
import DownloadIcon from '@/components/icons/DownloadIcon.vue';

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

const emit = defineEmits<{
    (e: 'download', item: PaymentHistoryItem): void;
}>();

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'success':
            return 'bg-success/10 text-success';
        case 'failed':
            return 'bg-danger/10 text-danger';
        case 'pending':
            return 'bg-warning/10 text-warning';
        default:
            return 'bg-info/10 text-info';
    }
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Billing History</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Your past payments and invoices.
            </p>
        </div>
        <div class="divide-y divide-border">
            <!-- Table Header -->
            <div class="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-foreground/60 uppercase tracking-wider">
                <div class="col-span-3">Date</div>
                <div class="col-span-2">Amount</div>
                <div class="col-span-3">Plan</div>
                <div class="col-span-2">Status</div>
                <div class="col-span-2 text-right">Invoice</div>
            </div>

            <!-- Empty State -->
            <div v-if="history.length === 0" class="text-center py-12 text-foreground/60">
                <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <DownloadIcon class="w-8 h-8 text-foreground/40" />
                </div>
                <p>No payment history found.</p>
            </div>

            <!-- Table Rows -->
            <div
                v-for="item in history"
                :key="item.id"
                class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-all"
            >
                <div class="col-span-3">
                    <p class="text-sm font-medium text-foreground">{{ item.date }}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-foreground">${{ item.amount }}</p>
                </div>
                <div class="col-span-3">
                    <p class="text-sm text-foreground">{{ item.plan }}</p>
                </div>
                <div class="col-span-2">
                    <span
                        :class="`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyles(item.status)}`"
                    >
                        {{ capitalize(item.status) }}
                    </span>
                </div>
                <div class="col-span-2 flex justify-end">
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
                        @click="emit('download', item)"
                    >
                        <DownloadIcon class="w-4 h-4" />
                        <span>Download</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
