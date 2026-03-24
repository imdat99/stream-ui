<script lang="ts" setup>
import AppDialog from '@/components/ui/AppDialog.vue';
import { useAuthStore } from '@/stores/auth';
defineProps<{
    visible: boolean;
    selectedPlan: {
        name: string;
        description?: string;
        price: number;
    } | null;
    selectedTermMonths: number;
    walletBalance: number;
    purchaseTopupAmount: number | null;
    purchaseError: string | null;
    purchaseLoading: boolean;
    onUpgradeDialogVisibilityChange: (visible: boolean) => void;
    selectUpgradePaymentMethod: (method: 'wallet' | 'topup') => void;
    closeUpgradeDialog: () => void;
}>();
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'selectUpgradePaymentMethod', method: 'wallet' | 'topup'): void;
    (e: 'closeUpgradeDialog'): void;
}>();
const TERM_OPTIONS = [1, 3, 6, 12] as const;

const auth = useAuthStore();
</script>
<template>
    <AppDialog :visible="visible" :title="$t('settings.billing.upgradeDialog.title')"
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
</template>