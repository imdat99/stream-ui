<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useUsageQuery } from '@/composables/useUsageQuery';
import { getApiErrorMessage } from '@/lib/utils';
import BillingTopupDialog from '@/routes/settings/Billing/components/BillingTopupDialog.vue';
import BillingUsageSection from '@/routes/settings/Billing/components/BillingUsageSection.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import type { Plan as ModelPlan } from '@/server/gen/proto/app/v1/common';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';
import SettingsRow from '../components/SettingsRow.vue';
import PaymentHistory from './components/PaymentHistory';
import PlanSelection from './components/PlanSelection';
import UpgradePlan from './components/UpgradePlan';

const toast = useAppToast();
const auth = useAuthStore();
const { t } = useTranslation();

const { refetch: refetchUsage } = useUsageQuery();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

const upgradeDialogVisible = ref(false);
const selectedPlan = ref<ModelPlan | null>(null);

const currentPlanId = computed(() => auth.user?.plan_id || undefined);
const selectedPlanId = computed(() => (upgradeDialogVisible.value ? selectedPlan.value?.id || '' : ''));
const walletBalance = computed(() => auth.user?.wallet_balance || 0);

const refreshBillingState = async () => {
    await Promise.allSettled([
        auth.fetchMe(),
        refetchUsage(),
    ]);
};

const openUpgradeDialog = (plan: ModelPlan) => {
    selectedPlan.value = plan;
    upgradeDialogVisible.value = true;
};

const closeUpgradeDialog = () => {
    upgradeDialogVisible.value = false;
    selectedPlan.value = null;
};

const handleUpgradeVisibilityChange = (visible: boolean) => {
    upgradeDialogVisible.value = visible;

    if (!visible) {
        selectedPlan.value = null;
    }
};

const handleUpgradeSuccess = async () => {
    await refreshBillingState();
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

        <PlanSelection
            :current-plan-id="currentPlanId"
            :selected-plan-id="selectedPlanId"
            @upgrade="openUpgradeDialog"
        />
        <BillingUsageSection />
        <PaymentHistory />
    </SettingsSectionCard>

    <BillingTopupDialog
        :visible="topupDialogVisible"
        :presets="topupPresets"
        :amount="topupAmount"
        :loading="topupLoading"
        @update:visible="topupDialogVisible = $event"
        @update:amount="topupAmount = $event"
        @selectPreset="selectPreset"
        @submit="handleTopup(topupAmount || 0)"
    />

    <UpgradePlan
        :visible="upgradeDialogVisible"
        :selected-plan="selectedPlan"
        @update:visible="handleUpgradeVisibilityChange"
        @close="closeUpgradeDialog"
        @success="handleUpgradeSuccess"
    />
</template>
