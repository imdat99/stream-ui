<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import ActivityIcon from '@/components/icons/ActivityIcon.vue';
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import DownloadIcon from '@/components/icons/DownloadIcon.vue';
import UploadIcon from '@/components/icons/UploadIcon.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref } from 'vue';

const toast = useAppToast();
const auth = useAuthStore();

const { data, isPending, isLoading } = useQuery({
    key: () => ['payments-and-plans'],
    query: () => client.plans.plansList(),
});

const subscribing = ref<string | null>(null);

// Top-up state
const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(0);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

// Mock Payment History Data
const paymentHistory = ref([
    { id: 'inv_001', date: 'Oct 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-001' },
    { id: 'inv_002', date: 'Nov 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-002' },
    { id: 'inv_003', date: 'Dec 24, 2025', amount: 19.99, plan: 'Pro Plan', status: 'failed', invoiceId: 'INV-2025-003' },
    { id: 'inv_004', date: 'Jan 24, 2026', amount: 19.99, plan: 'Pro Plan', status: 'pending', invoiceId: 'INV-2026-001' },
]);

// Computed Usage (from user data)
const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240);
const uploadsUsed = ref(12);
const uploadsLimit = ref(50);

// Wallet balance (from user data or mock)
const walletBalance = computed(() => auth.user?.wallet_balance || 0);

const currentPlanId = computed(() => {
    if (auth.user?.plan_id) return auth.user.plan_id;
    if (Array.isArray(data?.value?.data?.data.plans) && data?.value?.data?.data.plans.length > 0) return data.value.data.data.plans[0].id;
    return undefined;
});

const currentPlan = computed(() => {
    if (!Array.isArray(data?.value?.data?.data.plans)) return undefined;
    return data.value.data.data.plans.find(p => p.id === currentPlanId.value);
});

// Percentages
const storagePercentage = computed(() =>
    Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100)
);
const uploadsPercentage = computed(() =>
    Math.min(Math.round((uploadsUsed.value / uploadsLimit.value) * 100), 100)
);

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 mins';
    return `${Math.floor(seconds / 60)} mins`;
};

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
    topupLoading.value = true;
    try {
        // TODO: Add API endpoint for top-up
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.add({
            severity: 'success',
            summary: 'Top-up Successful',
            detail: `$${amount} has been added to your wallet.`,
            life: 3000
        });
        topupDialogVisible.value = false;
        topupAmount.value = null;
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Top-up Failed',
            detail: e.message || 'Failed to process top-up.',
            life: 5000
        });
    } finally {
        topupLoading.value = false;
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

const openTopupDialog = () => {
    topupAmount.value = null;
    topupDialogVisible.value = true;
};

const selectPreset = (amount: number) => {
    topupAmount.value = amount;
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Billing & Plans</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Manage your subscription, wallet, and billing information.
            </p>
        </div>

        <!-- Content -->
        <div class="divide-y divide-border">
            <!-- Wallet Balance -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <CoinsIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Wallet Balance</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Current balance: ${{ walletBalance.toFixed(2) }}
                        </p>
                    </div>
                </div>
                <AppButton size="sm" @click="openTopupDialog">
                    <template #icon>
                        <PlusIcon class="w-4 h-4" />
                    </template>
                    Top Up
                </AppButton>
            </div>
             <!-- Available Plans -->
            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <CreditCardIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Available Plans</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Choose the plan that best fits your needs
                        </p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div v-for="i in 3" :key="i">
                        <div class="h-[200px] rounded-lg bg-muted/50 animate-pulse"></div>
                    </div>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        v-for="plan in data?.data?.data.plans || []"
                        :key="plan.id"
                        class="border border-border rounded-lg p-4 hover:bg-muted/30 transition-all"
                    >
                        <div class="mb-3">
                            <h3 class="text-lg font-semibold text-foreground">{{ plan.name }}</h3>
                            <p class="text-sm text-foreground/60 mt-1 min-h-[2.5rem]">{{ plan.description }}</p>
                        </div>

                        <div class="mb-4">
                            <span class="text-2xl font-bold text-foreground">${{ plan.price }}</span>
                            <span class="text-foreground/60 text-sm">/{{ plan.cycle }}</span>
                        </div>

                        <ul class="space-y-2 mb-4 text-sm">
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ formatBytes(plan.storage_limit || 0) }} Storage
                            </li>
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ formatDuration(plan.duration_limit) }} Max Duration
                            </li>
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ plan.upload_limit }} Uploads / day
                            </li>
                        </ul>

                        <button
                            :disabled="!!subscribing || plan.id === currentPlanId"
                            :class="[
                                'w-full py-2 px-4 rounded-md text-sm font-medium transition-all',
                                plan.id === currentPlanId
                                    ? 'bg-muted/50 text-foreground/60 cursor-not-allowed'
                                    : subscribing === plan.id
                                        ? 'bg-muted/50 text-foreground/60 cursor-wait'
                                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            ]"
                            @click="subscribe(plan)"
                        >
                            {{ plan.id === currentPlanId ? 'Current Plan' : (subscribing === plan.id ? 'Processing...' : 'Upgrade') }}
                        </button>
                    </div>
                </div>
            </div>
            <!-- Storage Usage -->
            <div class="px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <ActivityIcon class="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Storage</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used
                        </p>
                    </div>
                </div>
                <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                    <div
                        class="bg-primary h-full rounded-full transition-all duration-300"
                        :style="{ width: `${storagePercentage}%` }"
                    ></div>
                </div>
            </div>

            <!-- Uploads Usage -->
            <div class="px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <UploadIcon class="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Monthly Uploads</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ uploadsUsed }} of {{ uploadsLimit }} uploads
                        </p>
                    </div>
                </div>
                <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                    <div
                        class="bg-info h-full rounded-full transition-all duration-300"
                        :style="{ width: `${uploadsPercentage}%` }"
                    ></div>
                </div>
            </div>

            <!-- Payment History -->
            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <DownloadIcon class="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Payment History</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Your past payments and invoices
                        </p>
                    </div>
                </div>

                <div class="border border-border rounded-lg overflow-hidden">
                    <!-- Table Header -->
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-foreground/60 uppercase tracking-wider bg-muted/30">
                        <div class="col-span-3">Date</div>
                        <div class="col-span-2">Amount</div>
                        <div class="col-span-3">Plan</div>
                        <div class="col-span-2">Status</div>
                        <div class="col-span-2 text-right">Invoice</div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="paymentHistory.length === 0" class="text-center py-12 text-foreground/60">
                        <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <DownloadIcon class="w-8 h-8 text-foreground/40" />
                        </div>
                        <p>No payment history found.</p>
                    </div>

                    <!-- Table Rows -->
                    <div
                        v-for="item in paymentHistory"
                        :key="item.id"
                        class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-all border-t border-border"
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
                                @click="handleDownloadInvoice(item)"
                            >
                                <DownloadIcon class="w-4 h-4" />
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top-up Dialog -->
        <AppDialog
            :visible="topupDialogVisible"
            @update:visible="topupDialogVisible = $event"
            title="Top Up Wallet"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    Select an amount or enter a custom amount to add to your wallet.
                </p>

                <!-- Preset Amounts -->
                <div class="grid grid-cols-4 gap-3">
                    <button
                        v-for="preset in topupPresets"
                        :key="preset"
                        :class="[
                            'py-2 px-3 rounded-md text-sm font-medium transition-all',
                            topupAmount === preset
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-foreground hover:bg-muted'
                        ]"
                        @click="selectPreset(preset)"
                    >
                        ${{ preset }}
                    </button>
                </div>

                <!-- Custom Amount -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">Custom Amount</label>
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-semibold text-foreground">$</span>
                        <AppInput
                            v-model.number="topupAmount"
                            type="number"
                            placeholder="Enter amount"
                            inputClass="flex-1"
                            min="1"
                            step="1"
                        />
                    </div>
                </div>

                <!-- Info -->
                <div class="bg-muted/30 rounded-md p-3 text-xs text-foreground/60">
                    <p>Minimum top-up amount is $1. Funds will be added to your wallet immediately after payment.</p>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <AppButton
                        variant="secondary"
                        size="sm"
                        :disabled="topupLoading"
                        @click="topupDialogVisible = false"
                    >
                        Cancel
                    </AppButton>
                    <AppButton
                        size="sm"
                        :loading="topupLoading"
                        :disabled="!topupAmount || topupAmount < 1 || topupLoading"
                        @click="handleTopup(topupAmount || 0)"
                    >
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        Proceed to Payment
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
