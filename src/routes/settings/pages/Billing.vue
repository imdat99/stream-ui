<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import ActivityIcon from '@/components/icons/ActivityIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import DownloadIcon from '@/components/icons/DownloadIcon.vue';
import UploadIcon from '@/components/icons/UploadIcon.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';

const toast = useAppToast();
const auth = useAuthStore();
const { t } = useTranslation();

const { data, isLoading } = useQuery({
    key: () => ['payments-and-plans'],
    query: () => client.plans.plansList(),
});

const subscribing = ref<string | null>(null);

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(0);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

const paymentHistory = ref([
    { id: 'inv_001', date: 'Oct 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-001' },
    { id: 'inv_002', date: 'Nov 24, 2025', amount: 9.99, plan: 'Basic Plan', status: 'success', invoiceId: 'INV-2025-002' },
    { id: 'inv_003', date: 'Dec 24, 2025', amount: 19.99, plan: 'Pro Plan', status: 'failed', invoiceId: 'INV-2025-003' },
    { id: 'inv_004', date: 'Jan 24, 2026', amount: 19.99, plan: 'Pro Plan', status: 'pending', invoiceId: 'INV-2026-001' },
]);

const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240);
const uploadsUsed = ref(12);
const uploadsLimit = ref(50);

const walletBalance = computed(() => auth.user?.wallet_balance || 0);

const currentPlanId = computed(() => {
    if (auth.user?.plan_id) return auth.user.plan_id;
    if (Array.isArray(data?.value?.data?.data.plans) && data?.value?.data?.data.plans.length > 0) return data.value.data.data.plans[0].id;
    return undefined;
});

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
    if (!seconds) return t('settings.billing.durationMinutes', { minutes: 0 });
    return t('settings.billing.durationMinutes', { minutes: Math.floor(seconds / 60) });
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

const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
        success: t('settings.billing.status.success'),
        failed: t('settings.billing.status.failed'),
        pending: t('settings.billing.status.pending'),
    };
    return map[status] || status;
};

const currencyFormatter = computed(() => new Intl.NumberFormat(getActiveI18n()?.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
}));

const formatMoney = (amount: number) => currencyFormatter.value.format(amount);

const subscribe = async (plan: ModelPlan) => {
    if (!plan.id) return;
    subscribing.value = plan.id;
    try {
        await client.payments.paymentsCreate({
            amount: plan.price || 0,
            plan_id: plan.id,
        });
        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.subscriptionSuccessSummary'),
            detail: t('settings.billing.toast.subscriptionSuccessDetail', { plan: plan.name || '' }),
            life: 3000,
        });

        paymentHistory.value.unshift({
            id: `inv_${Date.now()}`,
            date: new Date().toLocaleDateString(getActiveI18n()?.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: plan.price || 0,
            plan: plan.name || t('settings.billing.unknownPlan'),
            status: 'success',
            invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        });
    } catch (err: any) {
        console.error(err);
        toast.add({
            severity: 'error',
            summary: t('settings.billing.toast.subscriptionFailedSummary'),
            detail: err.message || t('settings.billing.toast.subscriptionFailedDetail'),
            life: 5000,
        });
    } finally {
        subscribing.value = null;
    }
};

const handleTopup = async (amount: number) => {
    topupLoading.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.topupSuccessSummary'),
            detail: t('settings.billing.toast.topupSuccessDetail', { amount: formatMoney(amount) }),
            life: 3000,
        });
        topupDialogVisible.value = false;
        topupAmount.value = null;
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: t('settings.billing.toast.topupFailedSummary'),
            detail: e.message || t('settings.billing.toast.topupFailedDetail'),
            life: 5000,
        });
    } finally {
        topupLoading.value = false;
    }
};

const handleDownloadInvoice = (item: typeof paymentHistory.value[number]) => {
    toast.add({
        severity: 'info',
        summary: t('settings.billing.toast.downloadingSummary'),
        detail: t('settings.billing.toast.downloadingDetail', { invoiceId: item.invoiceId }),
        life: 2000,
    });

    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.downloadedSummary'),
            detail: t('settings.billing.toast.downloadedDetail', { invoiceId: item.invoiceId }),
            life: 3000,
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
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">{{ t('settings.content.billing.title') }}</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                {{ t('settings.content.billing.subtitle') }}
            </p>
        </div>

        <div class="divide-y divide-border">
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <CoinsIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.walletBalance') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.billing.currentBalance', { balance: formatMoney(walletBalance) }) }}
                        </p>
                    </div>
                </div>
                <AppButton size="sm" @click="openTopupDialog">
                    <template #icon>
                        <PlusIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.billing.topUp') }}
                </AppButton>
            </div>

            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <CreditCardIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.availablePlans') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.billing.availablePlansHint') }}
                        </p>
                    </div>
                </div>

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
                            <span class="text-2xl font-bold text-foreground">{{ formatMoney(plan.price || 0) }}</span>
                            <span class="text-foreground/60 text-sm">/{{ plan.cycle }}</span>
                        </div>

                        <ul class="space-y-2 mb-4 text-sm">
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ t('settings.billing.planStorage', { storage: formatBytes(plan.storage_limit || 0) }) }}
                            </li>
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ t('settings.billing.planDuration', { duration: formatDuration(plan.duration_limit) }) }}
                            </li>
                            <li class="flex items-center gap-2 text-foreground/70">
                                <CheckIcon class="w-4 h-4 text-success shrink-0" />
                                {{ t('settings.billing.planUploads', { count: plan.upload_limit }) }}
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
                            {{ plan.id === currentPlanId
                                ? t('settings.billing.currentPlan')
                                : (subscribing === plan.id ? t('settings.billing.processing') : t('settings.billing.upgrade')) }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <ActivityIcon class="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.storage') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.billing.storageUsedOfLimit', { used: formatBytes(storageUsed), limit: formatBytes(storageLimit) }) }}
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

            <div class="px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <UploadIcon class="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.monthlyUploads') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.billing.uploadsUsedOfLimit', { used: uploadsUsed, limit: uploadsLimit }) }}
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

            <div class="px-6 py-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <DownloadIcon class="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.paymentHistory') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.billing.paymentHistorySubtitle') }}
                        </p>
                    </div>
                </div>

                <div class="border border-border rounded-lg overflow-hidden">
                    <div class="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-foreground/60 uppercase tracking-wider bg-muted/30">
                        <div class="col-span-3">{{ t('settings.billing.table.date') }}</div>
                        <div class="col-span-2">{{ t('settings.billing.table.amount') }}</div>
                        <div class="col-span-3">{{ t('settings.billing.table.plan') }}</div>
                        <div class="col-span-2">{{ t('settings.billing.table.status') }}</div>
                        <div class="col-span-2 text-right">{{ t('settings.billing.table.invoice') }}</div>
                    </div>

                    <div v-if="paymentHistory.length === 0" class="text-center py-12 text-foreground/60">
                        <div class="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <DownloadIcon class="w-8 h-8 text-foreground/40" />
                        </div>
                        <p>{{ t('settings.billing.noPaymentHistory') }}</p>
                    </div>

                    <div
                        v-for="item in paymentHistory"
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
                            <span
                                :class="`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyles(item.status)}`"
                            >
                                {{ getStatusLabel(item.status) }}
                            </span>
                        </div>
                        <div class="col-span-2 flex justify-end">
                            <button
                                class="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md transition-all"
                                @click="handleDownloadInvoice(item)"
                            >
                                <DownloadIcon class="w-4 h-4" />
                                <span>{{ t('settings.billing.download') }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AppDialog
            :visible="topupDialogVisible"
            @update:visible="topupDialogVisible = $event"
            :title="t('settings.billing.topupDialog.title')"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    {{ t('settings.billing.topupDialog.subtitle') }}
                </p>

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
                        {{ formatMoney(preset) }}
                    </button>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">{{ t('settings.billing.topupDialog.customAmount') }}</label>
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-semibold text-foreground">$</span>
                        <AppInput
                            v-model.number="topupAmount"
                            type="number"
                            :placeholder="t('settings.billing.topupDialog.enterAmount')"
                            inputClass="flex-1"
                            min="1"
                            step="1"
                        />
                    </div>
                </div>

                <div class="bg-muted/30 rounded-md p-3 text-xs text-foreground/60">
                    <p>{{ t('settings.billing.topupDialog.hint') }}</p>
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
                        {{ t('common.cancel') }}
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
                        {{ t('settings.billing.topupDialog.proceed') }}
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
