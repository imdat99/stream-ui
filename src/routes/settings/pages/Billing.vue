<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { computed, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import WalletBalanceCard from '../components/WalletBalanceCard.vue';
import CurrentPlanCard from '../components/CurrentPlanCard.vue';
import UsageStatsCard from '../components/UsageStatsCard.vue';
import AvailablePlansCard from '../components/AvailablePlansCard.vue';
import PaymentHistoryCard from '../components/PaymentHistoryCard.vue';

const toast = useToast();
const auth = useAuthStore();

const { data, isPending, isLoading, refresh } = useQuery({
    key: () => ['payments-and-plans'],
    query: () => client.plans.plansList(),
});

const subscribing = ref<string | null>(null);

// Mock Payment History Data
const paymentHistory = ref([
    { id: 'inv_001', date: 'Oct 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-001' },
    { id: 'inv_002', date: 'Nov 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-002' },
    { id: 'inv_003', date: 'Dec 24, 2025', amount: 19.99, plan: 'Pro Plan', status: 'failed', invoiceId: 'INV-2025-003' },
    { id: 'inv_004', date: 'Jan 24, 2026', amount: 19.99, plan: 'Pro Plan', status: 'pending', invoiceId: 'INV-2026-001' },
]);

// Computed Usage (Mock if not in store)
const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240);
const uploadsUsed = ref(12);
const uploadsLimit = ref(50);

// Wallet balance (from user data or mock)
const walletBalance = computed(() => 0);

const currentPlanId = computed(() => {
    if (auth.user?.plan_id) return auth.user.plan_id;
    if (Array.isArray(data?.value?.data?.data.plans) && data?.value?.data?.data.plans.length > 0) return data.value.data.data.plans[0].id;
    return undefined;
});

const currentPlan = computed(() => {
    if (!Array.isArray(data?.value?.data?.data.plans)) return undefined;
    return data.value.data.data.plans.find(p => p.id === currentPlanId.value);
});

const subscribe = async (plan: ModelPlan) => {
    if (!plan.id) return;
    subscribing.value = plan.id;
    try {
        await client.payments.paymentsCreate({
            amount: plan.price || 0,
            plan_id: plan.id
        });
        toast.add({
            severity: 'success',
            summary: 'Subscription Successful',
            detail: `Successfully subscribed to ${plan.name}`,
            life: 3000
        });

        paymentHistory.value.unshift({
            id: `inv_${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: plan.price || 0,
            plan: plan.name || 'Unknown',
            status: 'success',
            invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`
        });
    } catch (err: any) {
        console.error(err);
        toast.add({
            severity: 'error',
            summary: 'Subscription Failed',
            detail: err.message || 'Failed to subscribe',
            life: 5000
        });
    } finally {
        subscribing.value = null;
    }
};

const handleTopup = async (amount: number) => {
    try {
        // Simulate API call for top-up
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.add({
            severity: 'success',
            summary: 'Top-up Successful',
            detail: `$${amount} has been added to your wallet.`,
            life: 3000
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Top-up Failed',
            detail: e.message || 'Failed to process top-up.',
            life: 5000
        });
    }
};

const handleDownloadInvoice = (item: typeof paymentHistory.value[number]) => {
    toast.add({
        severity: 'info',
        summary: 'Downloading',
        detail: `Downloading invoice #${item.invoiceId}...`,
        life: 2000
    });

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
    <div class="space-y-6">
        <WalletBalanceCard
            :balance="walletBalance"
            @topup="handleTopup"
        />

        <CurrentPlanCard
            :current-plan="currentPlan"
            @manage="() => {}"
        />

        <UsageStatsCard
            :storage-used="storageUsed"
            :storage-limit="storageLimit"
            :uploads-used="uploadsUsed"
            :uploads-limit="uploadsLimit"
        />

        <AvailablePlansCard
            :plans="data?.data?.data.plans || []"
            :is-loading="isLoading"
            :current-plan-id="currentPlanId"
            :subscribing-plan-id="subscribing"
            @subscribe="subscribe"
        />

        <PaymentHistoryCard
            :history="paymentHistory"
            @download="handleDownloadInvoice"
        />
    </div>
</template>
