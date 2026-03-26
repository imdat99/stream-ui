import { useTranslation } from 'i18next-vue';
import { computed, defineComponent, ref, watch, type PropType } from 'vue';

import { client } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useAppToast } from '@/composables/useAppToast';
import { getApiErrorMessage, getApiErrorPayload } from '@/lib/utils';
import type { Plan as ModelPlan } from '@/server/api/proto/app/v1/common';
import { useAuthStore } from '@/stores/auth';

const TERM_OPTIONS = [1, 3, 6, 12] as const;

type UpgradePaymentMethod = 'wallet' | 'topup';

const UpgradePlan = defineComponent({
    name: 'UpgradePlan',
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        selectedPlan: {
            type: Object as PropType<ModelPlan | null>,
            default: null,
        },
    },
    emits: {
        'update:visible': (_visible: boolean) => true,
        close: () => true,
        success: () => true,
    },
    setup(props, { emit }) {
        const toast = useAppToast();
        const auth = useAuthStore();
        const { t } = useTranslation();

        const selectedTermMonths = ref<number>(1);
        const selectedPaymentMethod = ref<UpgradePaymentMethod>('wallet');
        const purchaseTopupAmount = ref<number | null>(null);
        const purchaseLoading = ref(false);
        const purchaseError = ref<string | null>(null);

        const walletBalance = computed(() => auth.user?.wallet_balance || 0);
        const selectedPlanPrice = computed(() => props.selectedPlan?.price || 0);
        const selectedTotalAmount = computed(() => selectedPlanPrice.value * selectedTermMonths.value);
        const selectedShortfall = computed(() => Math.max(selectedTotalAmount.value - walletBalance.value, 0));
        const selectedNeedsTopup = computed(() => selectedShortfall.value > 0.000001);

        const canSubmitUpgrade = computed(() => {
            if (!props.selectedPlan?.id || purchaseLoading.value) return false;
            if (!selectedNeedsTopup.value) return true;
            if (selectedPaymentMethod.value !== 'topup') return false;

            const topupAmount = purchaseTopupAmount.value || 0;
            return topupAmount >= selectedShortfall.value && topupAmount > 0;
        });

        const upgradeSubmitLabel = computed(() => {
            if (selectedNeedsTopup.value && selectedPaymentMethod.value === 'topup') {
                return t('settings.billing.upgradeDialog.topupAndUpgrade');
            }

            return t('settings.billing.upgradeDialog.payWithWallet');
        });

        const getApiErrorData = (error: unknown) => getApiErrorPayload(error)?.data || null;

        const resetUpgradeState = (plan: ModelPlan | null = props.selectedPlan) => {
            const shortfall = Math.max((plan?.price || 0) - walletBalance.value, 0);
            const needsTopup = shortfall > 0.000001;

            selectedTermMonths.value = 1;
            selectedPaymentMethod.value = needsTopup ? 'topup' : 'wallet';
            purchaseTopupAmount.value = needsTopup ? Number(shortfall.toFixed(2)) : null;
            purchaseLoading.value = false;
            purchaseError.value = null;
        };

        const emitClose = () => {
            emit('update:visible', false);
            emit('close');
        };

        const closeDialog = () => {
            if (purchaseLoading.value) return;
            emitClose();
        };

        watch(
            () => props.visible,
            (visible) => {
                if (visible) {
                    resetUpgradeState(props.selectedPlan);
                    return;
                }

                resetUpgradeState(null);
            },
            { immediate: true },
        );

        watch(
            () => props.selectedPlan?.id,
            (planId, previousPlanId) => {
                if (!props.visible) return;
                if (planId === previousPlanId) return;
                resetUpgradeState(props.selectedPlan);
            },
        );

        watch(selectedShortfall, (value) => {
            if (!props.visible) return;

            if (value <= 0) {
                selectedPaymentMethod.value = 'wallet';
                purchaseTopupAmount.value = null;
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
            if (!props.selectedPlan?.id) return;

            purchaseLoading.value = true;
            purchaseError.value = null;

            try {
                const paymentMethod: UpgradePaymentMethod = selectedNeedsTopup.value ? selectedPaymentMethod.value : 'wallet';
                const payload: Parameters<typeof client.createPayment>[0] = {
                    planId: props.selectedPlan.id,
                    termMonths: selectedTermMonths.value,
                    paymentMethod,
                };

                if (paymentMethod === 'topup') {
                    payload.topupAmount = purchaseTopupAmount.value || selectedShortfall.value;
                }

                await client.createPayment(payload);

                toast.add({
                    severity: 'success',
                    summary: t('settings.billing.toast.subscriptionSuccessSummary'),
                    detail: t('settings.billing.toast.subscriptionSuccessDetail', {
                        plan: props.selectedPlan.name || '',
                        term: t('settings.billing.termOption', { months: selectedTermMonths.value }),
                    }),
                    life: 3000,
                });

                emit('success');
                emitClose();
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

        return () => (
            <AppDialog
                visible={props.visible}
                closable={!purchaseLoading.value}
                title={t('settings.billing.upgradeDialog.title')}
                maxWidthClass="max-w-2xl"
                onUpdate:visible={(visible: boolean) => { emit('update:visible', visible); }}
                onClose={() => { emit('close'); }}
                v-slots={{
                    default: () => (
                        <>
                            {props.selectedPlan ? (
                                <div class="space-y-5">
                                    <div class="rounded-lg border border-border bg-muted/20 p-4">
                                        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p class="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
                                                    {t('settings.billing.upgradeDialog.selectedPlan')}
                                                </p>
                                                <h3 class="mt-1 text-lg font-semibold text-foreground">{props.selectedPlan.name}</h3>
                                                <p class="mt-1 text-sm text-foreground/70">
                                                    {props.selectedPlan.description || t('settings.billing.availablePlansHint')}
                                                </p>
                                            </div>

                                            <div class="text-left md:text-right">
                                                <p class="text-xs text-foreground/50">{t('settings.billing.upgradeDialog.basePrice')}</p>
                                                <p class="mt-1 text-2xl font-semibold text-foreground">
                                                    {auth.formatMoney(props.selectedPlan.price || 0)}
                                                </p>
                                                <p class="text-xs text-foreground/60">{t('settings.billing.upgradeDialog.perMonthBase')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        <div>
                                            <p class="text-sm font-medium text-foreground">{t('settings.billing.upgradeDialog.termTitle')}</p>
                                            <p class="mt-1 text-xs text-foreground/60">{t('settings.billing.upgradeDialog.termHint')}</p>
                                        </div>

                                        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {TERM_OPTIONS.map((months) => (
                                                <button
                                                    key={months}
                                                    type="button"
                                                    class={[
                                                        'rounded-lg border px-4 py-3 text-left transition-all',
                                                        selectedTermMonths.value === months
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-border bg-header text-foreground hover:border-primary/30 hover:bg-muted/30',
                                                    ]}
                                                    onClick={() => (selectedTermMonths.value = months)}
                                                >
                                                    <p class="text-sm font-medium">{t('settings.billing.termOption', { months })}</p>
                                                    <p class="mt-1 text-xs text-foreground/60">
                                                        {auth.formatMoney((props.selectedPlan?.price || 0) * months)}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div class="grid gap-3 md:grid-cols-3">
                                        <div class="rounded-lg border border-border bg-header p-4">
                                            <p class="text-xs uppercase tracking-wide text-foreground/50">
                                                {t('settings.billing.upgradeDialog.totalLabel')}
                                            </p>
                                            <p class="mt-2 text-xl font-semibold text-foreground">
                                                {auth.formatMoney(selectedTotalAmount.value)}
                                            </p>
                                        </div>
                                        <div class="rounded-lg border border-border bg-header p-4">
                                            <p class="text-xs uppercase tracking-wide text-foreground/50">
                                                {t('settings.billing.upgradeDialog.walletBalanceLabel')}
                                            </p>
                                            <p class="mt-2 text-xl font-semibold text-foreground">
                                                {auth.formatMoney(walletBalance.value)}
                                            </p>
                                        </div>
                                        <div
                                            class={[
                                                'rounded-lg border p-4',
                                                selectedNeedsTopup.value ? 'border-warning/30 bg-warning/10' : 'border-success/20 bg-success/5',
                                            ]}
                                        >
                                            <p class="text-xs uppercase tracking-wide text-foreground/50">
                                                {t('settings.billing.upgradeDialog.shortfallLabel')}
                                            </p>
                                            <p class={[
                                                'mt-2 text-xl font-semibold',
                                                selectedNeedsTopup.value ? 'text-warning' : 'text-success',
                                            ]}>
                                                {auth.formatMoney(selectedShortfall.value)}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedNeedsTopup.value ? (
                                        <div class="space-y-3">
                                            <div>
                                                <p class="text-sm font-medium text-foreground">
                                                    {t('settings.billing.upgradeDialog.paymentMethodTitle')}
                                                </p>
                                                <p class="mt-1 text-xs text-foreground/60">{t('settings.billing.upgradeDialog.paymentMethodHint')}</p>
                                            </div>

                                            <div class="grid gap-3 md:grid-cols-2">
                                                <button
                                                    type="button"
                                                    class={[
                                                        'rounded-lg border p-4 text-left transition-all',
                                                        selectedPaymentMethod.value === 'wallet' ? 'border-primary bg-primary/5' : 'border-border bg-header hover:border-primary/30 hover:bg-muted/30',
                                                    ]}
                                                    onClick={() => selectUpgradePaymentMethod('wallet')}
                                                >
                                                    <p class="text-sm font-medium text-foreground">{t('settings.billing.paymentMethod.wallet')}</p>
                                                    <p class="mt-1 text-xs text-foreground/60">{t('settings.billing.upgradeDialog.walletOptionDescription')}</p>
                                                </button>

                                                <button
                                                    type="button"
                                                    class={[
                                                        'rounded-lg border p-4 text-left transition-all',
                                                        selectedPaymentMethod.value === 'topup' ? 'border-primary bg-primary/5' : 'border-border bg-header hover:border-primary/30 hover:bg-muted/30',
                                                    ]}
                                                    onClick={() => selectUpgradePaymentMethod('topup')}
                                                >
                                                    <p class="text-sm font-medium text-foreground">{t('settings.billing.paymentMethod.topup')}</p>
                                                    <p class="mt-1 text-xs text-foreground/60">
                                                        {t('settings.billing.upgradeDialog.topupOptionDescription', { shortfall: auth.formatMoney(selectedShortfall.value) })}
                                                    </p>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div class="rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
                                            {t('settings.billing.upgradeDialog.walletCoveredHint')}
                                        </div>
                                    )}

                                    {selectedNeedsTopup.value && selectedPaymentMethod.value === 'topup' && (
                                        <div class="grid gap-2">
                                            <label class="text-sm font-medium text-foreground">{t('settings.billing.upgradeDialog.topupAmountLabel')}</label>
                                            <AppInput
                                                modelValue={purchaseTopupAmount.value}
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                placeholder={t('settings.billing.upgradeDialog.topupAmountPlaceholder')}
                                                onUpdate:modelValue={updatePurchaseTopupAmount}
                                            />
                                            <p class="text-xs text-foreground/60">
                                                {t('settings.billing.upgradeDialog.topupAmountHint', { shortfall: auth.formatMoney(selectedShortfall.value) })}
                                            </p>
                                        </div>
                                    )}

                                    {selectedNeedsTopup.value && selectedPaymentMethod.value === 'wallet' && (
                                        <div class="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                                            {t('settings.billing.upgradeDialog.walletInsufficientHint', { shortfall: auth.formatMoney(selectedShortfall.value) })}
                                        </div>
                                    )}

                                    {purchaseError.value && (
                                        <div class="rounded-lg border border-danger bg-danger/10 p-4 text-sm text-danger">
                                            {purchaseError.value}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </>
                    ),
                    footer: () => (
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p class="text-xs text-foreground/60">{t('settings.billing.upgradeDialog.footerHint')}</p>
                            <div class="flex justify-end gap-3">
                                <AppButton variant="secondary" size="sm" disabled={purchaseLoading.value} onClick={closeDialog}>
                                    {t('common.cancel')}
                                </AppButton>
                                <AppButton size="sm" loading={purchaseLoading.value} disabled={!canSubmitUpgrade.value} onClick={submitUpgrade}>
                                    {upgradeSubmitLabel.value}
                                </AppButton>
                            </div>
                        </div>
                    ),
                }}
            />
        );
    },
});

export default UpgradePlan;
