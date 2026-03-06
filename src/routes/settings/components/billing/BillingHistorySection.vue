<script setup lang="ts">
import DownloadIcon from '@/components/icons/DownloadIcon.vue';

type PaymentHistoryItem = {
    id: string;
    date: string;
    amount: number;
    plan: string;
    status: string;
    invoiceId: string;
};

defineProps<{
    title: string;
    description: string;
    items: PaymentHistoryItem[];
    formatMoney: (amount: number) => string;
    getStatusStyles: (status: string) => string;
    getStatusLabel: (status: string) => string;
    dateLabel: string;
    amountLabel: string;
    planLabel: string;
    statusLabel: string;
    invoiceLabel: string;
    emptyLabel: string;
    downloadLabel: string;
}>();

const emit = defineEmits<{
    (e: 'download', item: PaymentHistoryItem): void;
}>();
</script>

<template>
    <div class="px-6 py-4">
        <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                <DownloadIcon class="w-5 h-5 text-info" />
            </div>
            <div>
                <p class="text-sm font-medium text-foreground">{{ title }}</p>
                <p class="text-xs text-foreground/60 mt-0.5">{{ description }}</p>
            </div>
        </div>

        <div class="border border-border rounded-lg overflow-hidden">
            <div class="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-foreground/60 uppercase tracking-wider bg-muted/30">
                <div class="col-span-3">{{ dateLabel }}</div>
                <div class="col-span-2">{{ amountLabel }}</div>
                <div class="col-span-3">{{ planLabel }}</div>
                <div class="col-span-2">{{ statusLabel }}</div>
                <div class="col-span-2 text-right">{{ invoiceLabel }}</div>
            </div>

            <div v-if="items.length === 0" class="text-center py-12 text-foreground/60">
                <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <DownloadIcon class="w-8 h-8 text-foreground/40" />
                </div>
                <p>{{ emptyLabel }}</p>
            </div>

            <div
                v-for="item in items"
                :key="item.id"
                class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-all border-t border-border"
            >
                <div class="col-span-3">
                    <p class="text-sm font-medium text-foreground">{{ item.date }}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-foreground">{{ formatMoney(item.amount) }}</p>
                </div>
                <div class="col-span-3">
                    <p class="text-sm text-foreground">{{ item.plan }}</p>
                </div>
                <div class="col-span-2">
                    <span :class="`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyles(item.status)}`">
                        {{ getStatusLabel(item.status) }}
                    </span>
                </div>
                <div class="col-span-2 flex justify-end">
                    <button
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
                        @click="emit('download', item)"
                    >
                        <DownloadIcon class="w-4 h-4" />
                        <span>{{ downloadLabel }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
