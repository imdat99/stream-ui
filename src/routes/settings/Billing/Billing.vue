<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import { useAppToast } from '@/composables/useAppToast';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import BillingHistorySection from '@/routes/settings/components/billing/BillingHistorySection.vue';
import BillingPlansSection from '@/routes/settings/components/billing/BillingPlansSection.vue';
import BillingTopupDialog from '@/routes/settings/components/billing/BillingTopupDialog.vue';
import BillingUsageSection from '@/routes/settings/components/billing/BillingUsageSection.vue';
import BillingWalletRow from '@/routes/settings/components/billing/BillingWalletRow.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';

const toast = useAppToast();
const auth = useAuthStore();
const { t, i18next } = useTranslation();

const { data, isLoading } = useQuery({
    key: () => ['payments-and-plans'],
    query: () => client.plans.plansList(),
});

const subscribing = ref<string | null>(null);

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(0);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

type PaymentHistoryItem = {
    id: string;
    date: string;
    amount: number;
    plan: string;
    status: string;
    invoiceId: string;
};

const paymentHistory = ref<PaymentHistoryItem[]>([
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

const plans = computed(() => data.value?.data?.data.plans || []);

const storagePercentage = computed(() =>
    Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100)
);
const uploadsPercentage = computed(() =>
    Math.min(Math.round((uploadsUsed.value / uploadsLimit.value) * 100), 100)
);

const localeTag = computed(() => i18next.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US');

const currencyFormatter = computed(() => new Intl.NumberFormat(localeTag.value, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
}));

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${new Intl.NumberFormat(localeTag.value).format(value)} ${sizes[i]}`;
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

const formatMoney = (amount: number) => currencyFormatter.value.format(amount);

const getPlanStorageText = (plan: ModelPlan) => t('settings.billing.planStorage', { storage: formatBytes(plan.storage_limit || 0) });
const getPlanDurationText = (plan: ModelPlan) => t('settings.billing.planDuration', { duration: formatDuration(plan.duration_limit) });
const getPlanUploadsText = (plan: ModelPlan) => t('settings.billing.planUploads', { count: plan.upload_limit });

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
            date: new Date().toLocaleDateString(localeTag.value, { month: 'short', day: 'numeric', year: 'numeric' }),
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

const handleDownloadInvoice = (item: PaymentHistoryItem) => {
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
    <SettingsSectionCard
        :title="t('settings.content.billing.title')"
        :description="t('settings.content.billing.subtitle')"
    >
        <BillingWalletRow
            :title="t('settings.billing.walletBalance')"
            :description="t('settings.billing.currentBalance', { balance: formatMoney(walletBalance) })"
            :button-label="t('settings.billing.topUp')"
            @topup="openTopupDialog"
        />

        <BillingPlansSection
            :title="t('settings.billing.availablePlans')"
            :description="t('settings.billing.availablePlansHint')"
            :is-loading="isLoading"
            :plans="plans"
            :current-plan-id="currentPlanId"
            :subscribing="subscribing"
            :format-money="formatMoney"
            :get-plan-storage-text="getPlanStorageText"
            :get-plan-duration-text="getPlanDurationText"
            :get-plan-uploads-text="getPlanUploadsText"
            :current-plan-label="t('settings.billing.currentPlan')"
            :processing-label="t('settings.billing.processing')"
            :upgrade-label="t('settings.billing.upgrade')"
            @subscribe="subscribe"
        />

        <BillingUsageSection
            :storage-title="t('settings.billing.storage')"
            :storage-description="t('settings.billing.storageUsedOfLimit', { used: formatBytes(storageUsed), limit: formatBytes(storageLimit) })"
            :storage-percentage="storagePercentage"
            :uploads-title="t('settings.billing.monthlyUploads')"
            :uploads-description="t('settings.billing.uploadsUsedOfLimit', { used: uploadsUsed, limit: uploadsLimit })"
            :uploads-percentage="uploadsPercentage"
        />

        <BillingHistorySection
            :title="t('settings.billing.paymentHistory')"
            :description="t('settings.billing.paymentHistorySubtitle')"
            :items="paymentHistory"
            :format-money="formatMoney"
            :get-status-styles="getStatusStyles"
            :get-status-label="getStatusLabel"
            :date-label="t('settings.billing.table.date')"
            :amount-label="t('settings.billing.table.amount')"
            :plan-label="t('settings.billing.table.plan')"
            :status-label="t('settings.billing.table.status')"
            :invoice-label="t('settings.billing.table.invoice')"
            :empty-label="t('settings.billing.noPaymentHistory')"
            :download-label="t('settings.billing.download')"
            @download="handleDownloadInvoice"
        />
    </SettingsSectionCard>

    <BillingTopupDialog
        :visible="topupDialogVisible"
        :title="t('settings.billing.topupDialog.title')"
        :subtitle="t('settings.billing.topupDialog.subtitle')"
        :presets="topupPresets"
        :amount="topupAmount"
        :loading="topupLoading"
        :custom-amount-label="t('settings.billing.topupDialog.customAmount')"
        :amount-placeholder="t('settings.billing.topupDialog.enterAmount')"
        :hint="t('settings.billing.topupDialog.hint')"
        :cancel-label="t('common.cancel')"
        :proceed-label="t('settings.billing.topupDialog.proceed')"
        :format-money="formatMoney"
        @update:visible="topupDialogVisible = $event"
        @update:amount="topupAmount = $event"
        @selectPreset="selectPreset"
        @submit="handleTopup(topupAmount || 0)"
    />
</template>
