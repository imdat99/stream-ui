<script setup lang="ts">
import { client, type ModelPlan } from '@/api/client';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useUsageQuery } from '@/composables/useUsageQuery';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import BillingHistorySection from '@/routes/settings/components/billing/BillingHistorySection.vue';
import BillingPlansSection from '@/routes/settings/components/billing/BillingPlansSection.vue';
import BillingTopupDialog from '@/routes/settings/components/billing/BillingTopupDialog.vue';
import BillingUsageSection from '@/routes/settings/components/billing/BillingUsageSection.vue';
import BillingWalletRow from '@/routes/settings/components/billing/BillingWalletRow.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';

const TERM_OPTIONS = [1, 3, 6, 12] as const;
type UpgradePaymentMethod = 'wallet' | 'topup';

type PlansEnvelope = {
    data?: {
        plans?: ModelPlan[];
    } | ModelPlan[];
};

type PaymentHistoryApiItem = {
    id?: string;
    amount?: number;
    currency?: string;
    status?: string;
    plan_name?: string;
    invoice_id?: string;
    kind?: string;
    term_months?: number;
    payment_method?: string;
    expires_at?: string;
    created_at?: string;
};

type PaymentHistoryEnvelope = {
    data?: {
        payments?: PaymentHistoryApiItem[];
    };
};

type PaymentHistoryItem = {
    id: string;
    date: string;
    amount: number;
    plan: string;
    status: string;
    invoiceId: string;
    currency: string;
    kind: string;
    details?: string[];
};

type ApiErrorPayload = {
    code?: number;
    message?: string;
    data?: Record<string, any>;
};

const toast = useAppToast();
const auth = useAuthStore();
const { t, i18next } = useTranslation();

const { data: plansResponse, isLoading } = useQuery({
    key: () => ['billing-plans'],
    query: () => client.plans.plansList({ baseUrl: '/r' }),
});
const { data: usageSnapshot, refetch: refetchUsage } = useUsageQuery();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);
const topupLoading = ref(false);
const historyLoading = ref(false);
const downloadingInvoiceId = ref<string | null>(null);
const topupPresets = [10, 20, 50, 100];
const paymentHistory = ref<PaymentHistoryItem[]>([]);

const upgradeDialogVisible = ref(false);
const selectedPlan = ref<ModelPlan | null>(null);
const selectedTermMonths = ref<number>(1);
const selectedPaymentMethod = ref<UpgradePaymentMethod>('wallet');
const purchaseTopupAmount = ref<number | null>(null);
const purchaseLoading = ref(false);
const purchaseError = ref<string | null>(null);

const plans = computed(() => {
    const body = plansResponse.value?.data as PlansEnvelope | undefined;
    const payload = body?.data;

    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object' && Array.isArray(payload.plans)) {
        return payload.plans;
    }

    return [] as ModelPlan[];
});

const currentPlanId = computed(() => auth.user?.plan_id || undefined);
const currentPlan = computed(() => plans.value.find(plan => plan.id === currentPlanId.value));
const currentPlanName = computed(() => currentPlan.value?.name || t('settings.billing.unknownPlan'));
const walletBalance = computed(() => auth.user?.wallet_balance || 0);
const storageUsed = computed(() => usageSnapshot.value?.totalStorage ?? 0);
const uploadsUsed = computed(() => usageSnapshot.value?.totalVideos ?? 0);
const storageLimit = computed(() => {
    const activePlan = plans.value.find(plan => plan.id === currentPlanId.value);
    return activePlan?.storage_limit || 10737418240;
});
const uploadsLimit = computed(() => {
    const activePlan = plans.value.find(plan => plan.id === currentPlanId.value);
    return activePlan?.upload_limit || 50;
});
const storagePercentage = computed(() =>
    Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100),
);
const uploadsPercentage = computed(() =>
    Math.min(Math.round((uploadsUsed.value / uploadsLimit.value) * 100), 100),
);

const localeTag = computed(() => i18next.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US');
const currencyFormatter = computed(() => new Intl.NumberFormat(localeTag.value, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
}));
const shortDateFormatter = computed(() => new Intl.DateTimeFormat(localeTag.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
}));

const selectedPlanId = computed(() => upgradeDialogVisible.value ? selectedPlan.value?.id || null : null);
const selectedPlanPrice = computed(() => selectedPlan.value?.price || 0);
const selectedTotalAmount = computed(() => selectedPlanPrice.value * selectedTermMonths.value);
const selectedShortfall = computed(() => Math.max(selectedTotalAmount.value - walletBalance.value, 0));
const selectedNeedsTopup = computed(() => selectedShortfall.value > 0.000001);
const canSubmitUpgrade = computed(() => {
    if (!selectedPlan.value?.id || purchaseLoading.value) return false;
    if (!selectedNeedsTopup.value) return true;
    if (selectedPaymentMethod.value !== 'topup') return false;
    return (purchaseTopupAmount.value || 0) >= selectedShortfall.value && (purchaseTopupAmount.value || 0) > 0;
});
const upgradeSubmitLabel = computed(() => {
    if (selectedNeedsTopup.value && selectedPaymentMethod.value === 'topup') {
        return t('settings.billing.upgradeDialog.topupAndUpgrade');
    }

    return t('settings.billing.upgradeDialog.payWithWallet');
});

const formatMoney = (amount: number) => currencyFormatter.value.format(amount);

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
    if (seconds < 0) return t('settings.billing.durationMinutes', { minutes: -1 }).replace("-1", "∞")
    return t('settings.billing.durationMinutes', { minutes: Math.floor(seconds / 60) });
};

const formatHistoryDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return shortDateFormatter.value.format(date);
};

const formatTermLabel = (months: number) => t('settings.billing.termOption', { months });

const formatPaymentMethodLabel = (value?: string) => {
    switch ((value || '').toLowerCase()) {
        case 'topup':
            return t('settings.billing.paymentMethod.topup');
        case 'wallet':
        default:
            return t('settings.billing.paymentMethod.wallet');
    }
};

const getPlanStorageText = (plan: ModelPlan) => t('settings.billing.planStorage', { storage: formatBytes(plan.storage_limit || 0) });
const getPlanDurationText = (plan: ModelPlan) => t('settings.billing.planDuration', { duration: formatDuration(plan.duration_limit) });
const getPlanUploadsText = (plan: ModelPlan) => t('settings.billing.planUploads', { count: plan.upload_limit || 0 });

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

const normalizeHistoryStatus = (status?: string) => {
    switch ((status || '').toLowerCase()) {
        case 'success':
        case 'succeeded':
        case 'paid':
            return 'success';
        case 'failed':
        case 'error':
        case 'canceled':
        case 'cancelled':
            return 'failed';
        case 'pending':
        case 'processing':
        default:
            return 'pending';
    }
};

const getApiErrorPayload = (error: unknown): ApiErrorPayload | null => {
    if (!error || typeof error !== 'object') return null;
    const candidate = error as { error?: ApiErrorPayload; data?: ApiErrorPayload; message?: string };

    if (candidate.error && typeof candidate.error === 'object') return candidate.error;
    if (candidate.data && typeof candidate.data === 'object') return candidate.data;
    if (candidate.message) return { message: candidate.message };

    return null;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const payload = getApiErrorPayload(error);
    return payload?.message || fallback;
};

const getApiErrorData = (error: unknown) => getApiErrorPayload(error)?.data || null;

const mapHistoryItem = (item: PaymentHistoryApiItem): PaymentHistoryItem => {
    const details: string[] = [];

    if (item.kind !== 'wallet_topup' && item.term_months) {
        details.push(formatTermLabel(item.term_months));
    }
    if (item.kind !== 'wallet_topup' && item.payment_method) {
        details.push(formatPaymentMethodLabel(item.payment_method));
    }
    if (item.kind !== 'wallet_topup' && item.expires_at) {
        details.push(t('settings.billing.history.validUntil', { date: formatHistoryDate(item.expires_at) }));
    }

    return {
        id: item.id || '',
        date: formatHistoryDate(item.created_at),
        amount: item.amount || 0,
        plan: item.kind === 'wallet_topup'
            ? t('settings.billing.walletTopup')
            : (item.plan_name || t('settings.billing.unknownPlan')),
        status: normalizeHistoryStatus(item.status),
        invoiceId: item.invoice_id || '-',
        currency: item.currency || 'USD',
        kind: item.kind || 'subscription',
        details,
    };
};

const loadPaymentHistory = async () => {
    historyLoading.value = true;
    try {
        const response = await client.payments.historyList({ baseUrl: '/r' });
        const body = response.data as PaymentHistoryEnvelope | undefined;
        paymentHistory.value = (body?.data?.payments || []).map(mapHistoryItem);
    } catch (error) {
        console.error(error);
        paymentHistory.value = [];
    } finally {
        historyLoading.value = false;
    }
};

const refetchUsageSnapshot = () => refetchUsage((fetchError) => {
    throw fetchError;
});

const refreshBillingState = async () => {
    await Promise.allSettled([
        auth.fetchMe(),
        loadPaymentHistory(),
        refetchUsageSnapshot(),
    ]);
};

void loadPaymentHistory();

const subscriptionSummary = computed(() => {
    const expiresAt = auth.user?.plan_expires_at;
    const formattedDate = formatHistoryDate(expiresAt);

    if (auth.user?.plan_id) {
        if (auth.user?.plan_expiring_soon && expiresAt) {
            return {
                title: t('settings.billing.subscription.expiringTitle'),
                description: t('settings.billing.subscription.expiringDescription', {
                    plan: currentPlanName.value,
                    date: formattedDate,
                }),
                tone: 'warning' as const,
            };
        }

        if (expiresAt) {
            return {
                title: t('settings.billing.subscription.activeTitle'),
                description: t('settings.billing.subscription.activeDescription', {
                    plan: currentPlanName.value,
                    date: formattedDate,
                }),
                tone: 'default' as const,
            };
        }

        return {
            title: t('settings.billing.subscription.activeTitle'),
            description: currentPlanName.value,
            tone: 'default' as const,
        };
    }

    if (expiresAt) {
        return {
            title: t('settings.billing.subscription.expiredTitle'),
            description: t('settings.billing.subscription.expiredDescription', { date: formattedDate }),
            tone: 'warning' as const,
        };
    }

    return {
        title: t('settings.billing.subscription.freeTitle'),
        description: t('settings.billing.subscription.freeDescription'),
        tone: 'default' as const,
    };
});

const resetUpgradeState = () => {
    selectedPlan.value = null;
    selectedTermMonths.value = 1;
    selectedPaymentMethod.value = 'wallet';
    purchaseTopupAmount.value = null;
    purchaseError.value = null;
};

const openUpgradeDialog = (plan: ModelPlan) => {
    selectedPlan.value = plan;
    selectedTermMonths.value = 1;
    purchaseError.value = null;
    selectedPaymentMethod.value = walletBalance.value >= (plan.price || 0) ? 'wallet' : 'topup';
    purchaseTopupAmount.value = null;
    upgradeDialogVisible.value = true;
};

const closeUpgradeDialog = () => {
    if (purchaseLoading.value) return;
    upgradeDialogVisible.value = false;
    resetUpgradeState();
};

const onUpgradeDialogVisibilityChange = (visible: boolean) => {
    if (visible) {
        upgradeDialogVisible.value = true;
        return;
    }

    closeUpgradeDialog();
};

watch(selectedShortfall, (value) => {
    if (!upgradeDialogVisible.value) return;

    if (value <= 0) {
        selectedPaymentMethod.value = 'wallet';
        return;
    }

    if (selectedPaymentMethod.value === 'topup' && ((purchaseTopupAmount.value || 0) < value)) {
        purchaseTopupAmount.value = Number(value.toFixed(2));
    }
});

const selectUpgradePaymentMethod = (method: UpgradePaymentMethod) => {
    selectedPaymentMethod.value = method;
    purchaseError.value = null;

    if (method === 'topup' && selectedShortfall.value > 0 && ((purchaseTopupAmount.value || 0) < selectedShortfall.value)) {
        purchaseTopupAmount.value = Number(selectedShortfall.value.toFixed(2));
    }
};

const updatePurchaseTopupAmount = (value: string | number | null) => {
    if (typeof value === 'number' || value === null) {
        purchaseTopupAmount.value = value;
        return;
    }

    if (value === '') {
        purchaseTopupAmount.value = null;
        return;
    }

    const parsed = Number(value);
    purchaseTopupAmount.value = Number.isNaN(parsed) ? null : parsed;
};

const submitUpgrade = async () => {
    if (!selectedPlan.value?.id) return;

    purchaseLoading.value = true;
    purchaseError.value = null;

    try {
        const paymentMethod: UpgradePaymentMethod = selectedNeedsTopup.value ? selectedPaymentMethod.value : 'wallet';
        const payload: Record<string, any> = {
            plan_id: selectedPlan.value.id,
            term_months: selectedTermMonths.value,
            payment_method: paymentMethod,
        };

        if (paymentMethod === 'topup') {
            payload.topup_amount = purchaseTopupAmount.value || selectedShortfall.value;
        }

        await client.payments.paymentsCreate(payload, { baseUrl: '/r' });
        await refreshBillingState();

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.subscriptionSuccessSummary'),
            detail: t('settings.billing.toast.subscriptionSuccessDetail', {
                plan: selectedPlan.value.name || '',
                term: formatTermLabel(selectedTermMonths.value),
            }),
            life: 3000,
        });

        closeUpgradeDialog();
    } catch (error) {
        console.error(error);

        const errorData = getApiErrorData(error);
        const nextShortfall = typeof errorData?.shortfall === 'number'
            ? errorData.shortfall
            : selectedShortfall.value;

        if (nextShortfall > 0) {
            selectedPaymentMethod.value = 'topup';
            if ((purchaseTopupAmount.value || 0) < nextShortfall) {
                purchaseTopupAmount.value = Number(nextShortfall.toFixed(2));
            }
        }

        purchaseError.value = getApiErrorMessage(error, t('settings.billing.toast.subscriptionFailedDetail'));
    } finally {
        purchaseLoading.value = false;
    }
};

const handleTopup = async (amount: number) => {
    topupLoading.value = true;
    try {
        await client.wallet.topupsCreate({ amount }, { baseUrl: '/r' });
        await refreshBillingState();

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.topupSuccessSummary'),
            detail: t('settings.billing.toast.topupSuccessDetail', { amount: formatMoney(amount) }),
            life: 3000,
        });
        topupDialogVisible.value = false;
        topupAmount.value = null;
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: t('settings.billing.toast.topupFailedSummary'),
            detail: getApiErrorMessage(error, t('settings.billing.toast.topupFailedDetail')),
            life: 5000,
        });
    } finally {
        topupLoading.value = false;
    }
};

const handleDownloadInvoice = async (item: PaymentHistoryItem) => {
    if (!item.id) return;

    downloadingInvoiceId.value = item.id;
    toast.add({
        severity: 'info',
        summary: t('settings.billing.toast.downloadingSummary'),
        detail: t('settings.billing.toast.downloadingDetail', { invoiceId: item.invoiceId }),
        life: 2000,
    });

    try {
        const response = await client.payments.invoiceList(item.id, { baseUrl: '/r', format: 'text' });
        const content = typeof response.data === 'string' ? response.data : '';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${item.invoiceId}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.downloadedSummary'),
            detail: t('settings.billing.toast.downloadedDetail', { invoiceId: item.invoiceId }),
            life: 3000,
        });
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: t('settings.billing.toast.downloadFailedSummary'),
            detail: getApiErrorMessage(error, t('settings.billing.toast.downloadFailedDetail')),
            life: 5000,
        });
    } finally {
        downloadingInvoiceId.value = null;
    }
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
            :subscription-title="subscriptionSummary.title"
            :subscription-description="subscriptionSummary.description"
            :subscription-tone="subscriptionSummary.tone"
            @topup="openTopupDialog"
        />

        <BillingPlansSection
            :title="t('settings.billing.availablePlans')"
            :description="t('settings.billing.availablePlansHint')"
            :is-loading="isLoading"
            :plans="plans"
            :current-plan-id="currentPlanId"
            :selecting-plan-id="selectedPlanId"
            :format-money="formatMoney"
            :get-plan-storage-text="getPlanStorageText"
            :get-plan-duration-text="getPlanDurationText"
            :get-plan-uploads-text="getPlanUploadsText"
            :current-plan-label="t('settings.billing.currentPlan')"
            :selecting-label="t('settings.billing.upgradeDialog.selecting')"
            :choose-label="t('settings.billing.upgradeDialog.choosePlan')"
            @select="openUpgradeDialog"
        />

        <BillingUsageSection
            :storage-title="t('settings.billing.storage')"
            :storage-description="t('settings.billing.storageUsedOfLimit', { used: formatBytes(storageUsed), limit: formatBytes(storageLimit) })"
            :storage-percentage="storagePercentage"
            :uploads-title="t('settings.billing.totalVideos')"
            :uploads-description="t('settings.billing.totalVideosUsedOfLimit', { used: uploadsUsed, limit: uploadsLimit })"
            :uploads-percentage="uploadsPercentage"
        />

        <BillingHistorySection
            :title="t('settings.billing.paymentHistory')"
            :description="t('settings.billing.paymentHistorySubtitle')"
            :items="paymentHistory"
            :loading="historyLoading"
            :downloading-id="downloadingInvoiceId"
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

    <AppDialog
        :visible="upgradeDialogVisible"
        :title="t('settings.billing.upgradeDialog.title')"
        maxWidthClass="max-w-2xl"
        @update:visible="onUpgradeDialogVisibilityChange"
        @close="closeUpgradeDialog"
    >
        <div v-if="selectedPlan" class="space-y-5">
            <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
                            {{ t('settings.billing.upgradeDialog.selectedPlan') }}
                        </p>
                        <h3 class="mt-1 text-lg font-semibold text-foreground">{{ selectedPlan.name }}</h3>
                        <p class="mt-1 text-sm text-foreground/70">
                            {{ selectedPlan.description || t('settings.billing.availablePlansHint') }}
                        </p>
                    </div>

                    <div class="text-left md:text-right">
                        <p class="text-xs text-foreground/50">{{ t('settings.billing.upgradeDialog.basePrice') }}</p>
                        <p class="mt-1 text-2xl font-semibold text-foreground">{{ formatMoney(selectedPlan.price || 0) }}</p>
                        <p class="text-xs text-foreground/60">{{ t('settings.billing.upgradeDialog.perMonthBase') }}</p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <div>
                    <p class="text-sm font-medium text-foreground">{{ t('settings.billing.upgradeDialog.termTitle') }}</p>
                    <p class="mt-1 text-xs text-foreground/60">{{ t('settings.billing.upgradeDialog.termHint') }}</p>
                </div>

                <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <button
                        v-for="months in TERM_OPTIONS"
                        :key="months"
                        type="button"
                        :class="[
                            'rounded-lg border px-4 py-3 text-left transition-all',
                            selectedTermMonths === months
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-surface text-foreground hover:border-primary/30 hover:bg-muted/30',
                        ]"
                        @click="selectedTermMonths = months"
                    >
                        <p class="text-sm font-medium">{{ formatTermLabel(months) }}</p>
                        <p class="mt-1 text-xs text-foreground/60">{{ formatMoney((selectedPlan.price || 0) * months) }}</p>
                    </button>
                </div>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
                <div class="rounded-lg border border-border bg-surface p-4">
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{ t('settings.billing.upgradeDialog.totalLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold text-foreground">{{ formatMoney(selectedTotalAmount) }}</p>
                </div>
                <div class="rounded-lg border border-border bg-surface p-4">
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{ t('settings.billing.upgradeDialog.walletBalanceLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold text-foreground">{{ formatMoney(walletBalance) }}</p>
                </div>
                <div
                    class="rounded-lg border p-4"
                    :class="selectedNeedsTopup
                        ? 'border-warning/30 bg-warning/10'
                        : 'border-success/20 bg-success/5'"
                >
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{ t('settings.billing.upgradeDialog.shortfallLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold" :class="selectedNeedsTopup ? 'text-warning' : 'text-success'">
                        {{ formatMoney(selectedShortfall) }}
                    </p>
                </div>
            </div>

            <div v-if="selectedNeedsTopup" class="space-y-3">
                <div>
                    <p class="text-sm font-medium text-foreground">{{ t('settings.billing.upgradeDialog.paymentMethodTitle') }}</p>
                    <p class="mt-1 text-xs text-foreground/60">{{ t('settings.billing.upgradeDialog.paymentMethodHint') }}</p>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                    <button
                        type="button"
                        :class="[
                            'rounded-lg border p-4 text-left transition-all',
                            selectedPaymentMethod === 'wallet'
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-surface hover:border-primary/30 hover:bg-muted/30',
                        ]"
                        @click="selectUpgradePaymentMethod('wallet')"
                    >
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.paymentMethod.wallet') }}</p>
                        <p class="mt-1 text-xs text-foreground/60">
                            {{ t('settings.billing.upgradeDialog.walletOptionDescription') }}
                        </p>
                    </button>

                    <button
                        type="button"
                        :class="[
                            'rounded-lg border p-4 text-left transition-all',
                            selectedPaymentMethod === 'topup'
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-surface hover:border-primary/30 hover:bg-muted/30',
                        ]"
                        @click="selectUpgradePaymentMethod('topup')"
                    >
                        <p class="text-sm font-medium text-foreground">{{ t('settings.billing.paymentMethod.topup') }}</p>
                        <p class="mt-1 text-xs text-foreground/60">
                            {{ t('settings.billing.upgradeDialog.topupOptionDescription', { shortfall: formatMoney(selectedShortfall) }) }}
                        </p>
                    </button>
                </div>
            </div>

            <div v-else class="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
                {{ t('settings.billing.upgradeDialog.walletCoveredHint') }}
            </div>

            <div v-if="selectedNeedsTopup && selectedPaymentMethod === 'topup'" class="grid gap-2">
                <label class="text-sm font-medium text-foreground">{{ t('settings.billing.upgradeDialog.topupAmountLabel') }}</label>
                <AppInput
                    :model-value="purchaseTopupAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    :placeholder="t('settings.billing.upgradeDialog.topupAmountPlaceholder')"
                    @update:model-value="updatePurchaseTopupAmount"
                />
                <p class="text-xs text-foreground/60">
                    {{ t('settings.billing.upgradeDialog.topupAmountHint', { shortfall: formatMoney(selectedShortfall) }) }}
                </p>
            </div>

            <div
                v-if="selectedNeedsTopup && selectedPaymentMethod === 'wallet'"
                class="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
            >
                {{ t('settings.billing.upgradeDialog.walletInsufficientHint', { shortfall: formatMoney(selectedShortfall) }) }}
            </div>

            <div v-if="purchaseError" class="rounded-lg border border-danger bg-danger/10 p-4 text-sm text-danger">
                {{ purchaseError }}
            </div>
        </div>

        <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-xs text-foreground/60">
                    {{ t('settings.billing.upgradeDialog.footerHint') }}
                </p>
                <div class="flex justify-end gap-3">
                    <AppButton
                        variant="secondary"
                        size="sm"
                        :disabled="purchaseLoading"
                        @click="closeUpgradeDialog"
                    >
                        {{ t('common.cancel') }}
                    </AppButton>
                    <AppButton
                        size="sm"
                        :loading="purchaseLoading"
                        :disabled="!canSubmitUpgrade"
                        @click="submitUpgrade"
                    >
                        {{ upgradeSubmitLabel }}
                    </AppButton>
                </div>
            </div>
        </template>
    </AppDialog>

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
