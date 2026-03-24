<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useUsageQuery } from '@/composables/useUsageQuery';
import { getApiErrorMessage, getApiErrorPayload } from '@/lib/utils';
import BillingTopupDialog from '@/routes/settings/Billing/components/BillingTopupDialog.vue';
import BillingUsageSection from '@/routes/settings/Billing/components/BillingUsageSection.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import type { Plan as ModelPlan } from '@/server/gen/proto/app/v1/common';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import SettingsRow from '../components/SettingsRow.vue';
import PaymentHistory from './components/PaymentHistory';
import PlanSelection from './components/PlanSelection';

const TERM_OPTIONS = [1, 3, 6, 12] as const;
type UpgradePaymentMethod = 'wallet' | 'topup';

const toast = useAppToast();
const auth = useAuthStore();
const { t, i18next } = useTranslation();

const { refetch: refetchUsage } = useUsageQuery();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

const upgradeDialogVisible = ref(false);
const selectedPlan = ref<ModelPlan | null>(null);
const selectedTermMonths = ref<number>(1);
const selectedPaymentMethod = ref<UpgradePaymentMethod>('wallet');
const purchaseTopupAmount = ref<number | null>(null);
const purchaseLoading = ref(false);
const purchaseError = ref<string | null>(null);

const currentPlanId = computed(() => auth.user?.plan_id || undefined);
const walletBalance = computed(() => auth.user?.wallet_balance || 0);

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

const getApiErrorData = (error: unknown) => getApiErrorPayload(error)?.data || null;

const refreshBillingState = async () => {
    await Promise.allSettled([
        auth.fetchMe(),
        // loadPaymentHistory(),
        refetchUsage(),
    ]);
};

// void loadPaymentHistory();

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
        const payload: Parameters<typeof rpcClient.createPayment>[0] = {
            planId: selectedPlan.value.id,
            termMonths: selectedTermMonths.value,
            paymentMethod: paymentMethod,
        };

        if (paymentMethod === 'topup') {
            payload.topupAmount = purchaseTopupAmount.value || selectedShortfall.value;
        }

        await rpcClient.createPayment(payload);
        await refreshBillingState();

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.subscriptionSuccessSummary'),
            detail: t('settings.billing.toast.subscriptionSuccessDetail', {
                plan: selectedPlan.value.name || '',
                term: t('settings.billing.termOption', { months: selectedTermMonths.value })
                // term: formatTermLabel(selectedTermMonths.value),
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
        await rpcClient.topupWallet({ amount });
        await refreshBillingState();

        toast.add({
            severity: 'success',
            summary: t('settings.billing.toast.topupSuccessSummary'),
            detail: t('settings.billing.toast.topupSuccessDetail', { amount: auth.formatMoney(amount) }),
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

const openTopupDialog = () => {
    topupAmount.value = null;
    topupDialogVisible.value = true;
};

const selectPreset = (amount: number) => {
    topupAmount.value = amount;
};
</script>

<template>
    <SettingsSectionCard :title="$t('settings.content.billing.title')"
        :description="$t('settings.content.billing.subtitle')">
        <SettingsRow :title="$t('settings.billing.walletBalance')"
            :description="$t('settings.billing.currentBalance', { balance: auth.formatMoney(walletBalance) })"
            iconBoxClass="bg-primary/10">
            <template #icon>
                <CoinsIcon class="w-5 h-5 text-primary" />
            </template>

            <template #actions>
                <div class="flex flex-col items-end gap-2">
                    <AppButton size="sm" @click="openTopupDialog">
                        <template #icon>
                            <PlusIcon class="w-4 h-4" />
                        </template>
                        {{ $t('settings.billing.topUp') }}
                    </AppButton>
                </div>
            </template>
        </SettingsRow>

        <PlanSelection :current-plan-id="currentPlanId" :selectedPlanId="String(selectedPlanId)"
            @upgrade="openUpgradeDialog" />
        <BillingUsageSection />
        <PaymentHistory />
    </SettingsSectionCard>

    <AppDialog :visible="upgradeDialogVisible" :title="$t('settings.billing.upgradeDialog.title')"
        maxWidthClass="max-w-2xl" @update:visible="onUpgradeDialogVisibilityChange" @close="closeUpgradeDialog">
        <div v-if="selectedPlan" class="space-y-5">
            <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p class="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
                            {{ $t('settings.billing.upgradeDialog.selectedPlan') }}
                        </p>
                        <h3 class="mt-1 text-lg font-semibold text-foreground">{{ selectedPlan.name }}</h3>
                        <p class="mt-1 text-sm text-foreground/70">
                            {{ selectedPlan.description || $t('settings.billing.availablePlansHint') }}
                        </p>
                    </div>

                    <div class="text-left md:text-right">
                        <p class="text-xs text-foreground/50">{{ $t('settings.billing.upgradeDialog.basePrice') }}</p>
                        <p class="mt-1 text-2xl font-semibold text-foreground">{{ auth.formatMoney(selectedPlan.price ||
                            0)
                            }}</p>
                        <p class="text-xs text-foreground/60">{{ $t('settings.billing.upgradeDialog.perMonthBase') }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <div>
                    <p class="text-sm font-medium text-foreground">{{ $t('settings.billing.upgradeDialog.termTitle') }}
                    </p>
                    <p class="mt-1 text-xs text-foreground/60">{{ $t('settings.billing.upgradeDialog.termHint') }}</p>
                </div>

                <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <button v-for="months in TERM_OPTIONS" :key="months" type="button" :class="[
                        'rounded-lg border px-4 py-3 text-left transition-all',
                        selectedTermMonths === months
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-header text-foreground hover:border-primary/30 hover:bg-muted/30',
                    ]" @click="selectedTermMonths = months">
                        <p class="text-sm font-medium">{{ $t('settings.billing.termOption', { months }) }}</p>
                        <p class="mt-1 text-xs text-foreground/60">{{ auth.formatMoney((selectedPlan.price || 0) *
                            months)
                            }}</p>
                    </button>
                </div>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
                <div class="rounded-lg border border-border bg-header p-4">
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{
                        $t('settings.billing.upgradeDialog.totalLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold text-foreground">{{ auth.formatMoney(selectedTotalAmount) }}
                    </p>
                </div>
                <div class="rounded-lg border border-border bg-header p-4">
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{
                        $t('settings.billing.upgradeDialog.walletBalanceLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold text-foreground">{{ auth.formatMoney(walletBalance) }}</p>
                </div>
                <div class="rounded-lg border p-4" :class="selectedNeedsTopup
                    ? 'border-warning/30 bg-warning/10'
                    : 'border-success/20 bg-success/5'">
                    <p class="text-xs uppercase tracking-wide text-foreground/50">{{
                        $t('settings.billing.upgradeDialog.shortfallLabel') }}</p>
                    <p class="mt-2 text-xl font-semibold" :class="selectedNeedsTopup ? 'text-warning' : 'text-success'">
                        {{ auth.formatMoney(selectedShortfall) }}
                    </p>
                </div>
            </div>

            <div v-if="selectedNeedsTopup" class="space-y-3">
                <div>
                    <p class="text-sm font-medium text-foreground">{{
                        $t('settings.billing.upgradeDialog.paymentMethodTitle') }}</p>
                    <p class="mt-1 text-xs text-foreground/60">{{ $t('settings.billing.upgradeDialog.paymentMethodHint')
                        }}
                    </p>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                    <button type="button" :class="[
                        'rounded-lg border p-4 text-left transition-all',
                        selectedPaymentMethod === 'wallet'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-header hover:border-primary/30 hover:bg-muted/30',
                    ]" @click="selectUpgradePaymentMethod('wallet')">
                        <p class="text-sm font-medium text-foreground">{{ $t('settings.billing.paymentMethod.wallet') }}
                        </p>
                        <p class="mt-1 text-xs text-foreground/60">
                            {{ $t('settings.billing.upgradeDialog.walletOptionDescription') }}
                        </p>
                    </button>

                    <button type="button" :class="[
                        'rounded-lg border p-4 text-left transition-all',
                        selectedPaymentMethod === 'topup'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-header hover:border-primary/30 hover:bg-muted/30',
                    ]" @click="selectUpgradePaymentMethod('topup')">
                        <p class="text-sm font-medium text-foreground">{{ $t('settings.billing.paymentMethod.topup') }}
                        </p>
                        <p class="mt-1 text-xs text-foreground/60">
                            {{ $t('settings.billing.upgradeDialog.topupOptionDescription', {
                                shortfall:
                                    auth.formatMoney(selectedShortfall) }) }}
                        </p>
                    </button>
                </div>
            </div>

            <div v-else class="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
                {{ $t('settings.billing.upgradeDialog.walletCoveredHint') }}
            </div>

            <div v-if="selectedNeedsTopup && selectedPaymentMethod === 'topup'" class="grid gap-2">
                <label class="text-sm font-medium text-foreground">{{
                    $t('settings.billing.upgradeDialog.topupAmountLabel')
                    }}</label>
                <AppInput :model-value="purchaseTopupAmount" type="number" min="0.01" step="0.01"
                    :placeholder="$t('settings.billing.upgradeDialog.topupAmountPlaceholder')"
                    @update:model-value="updatePurchaseTopupAmount" />
                <p class="text-xs text-foreground/60">
                    {{ $t('settings.billing.upgradeDialog.topupAmountHint', {
                        shortfall:
                            auth.formatMoney(selectedShortfall)
                    }) }}
                </p>
            </div>

            <div v-if="selectedNeedsTopup && selectedPaymentMethod === 'wallet'"
                class="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                {{ $t('settings.billing.upgradeDialog.walletInsufficientHint', {
                    shortfall:
                        auth.formatMoney(selectedShortfall) }) }}
            </div>

            <div v-if="purchaseError" class="rounded-lg border border-danger bg-danger/10 p-4 text-sm text-danger">
                {{ purchaseError }}
            </div>
        </div>

        <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-xs text-foreground/60">
                    {{ $t('settings.billing.upgradeDialog.footerHint') }}
                </p>
                <div class="flex justify-end gap-3">
                    <AppButton variant="secondary" size="sm" :disabled="purchaseLoading" @click="closeUpgradeDialog">
                        {{ $t('common.cancel') }}
                    </AppButton>
                    <AppButton size="sm" :loading="purchaseLoading" :disabled="!canSubmitUpgrade"
                        @click="submitUpgrade">
                        {{ upgradeSubmitLabel }}
                    </AppButton>
                </div>
            </div>
        </template>
    </AppDialog>

    <BillingTopupDialog :visible="topupDialogVisible" :title="$t('settings.billing.topupDialog.title')"
        :subtitle="t('settings.billing.topupDialog.subtitle')" :presets="topupPresets" :amount="topupAmount"
        :loading="topupLoading" :custom-amount-label="t('settings.billing.topupDialog.customAmount')"
        :amount-placeholder="t('settings.billing.topupDialog.enterAmount')"
        :hint="t('settings.billing.topupDialog.hint')" :cancel-label="t('common.cancel')"
        :proceed-label="t('settings.billing.topupDialog.proceed')" @update:visible="topupDialogVisible = $event"
        @update:amount="topupAmount = $event" @selectPreset="selectPreset" @submit="handleTopup(topupAmount || 0)" />
</template>
