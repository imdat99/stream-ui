<script setup lang="ts">
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { useUsageQuery } from '@/composables/useUsageQuery';
import BillingTopupDialog from '@/routes/settings/Billing/components/BillingTopupDialog.vue';
import BillingUsageSection from '@/routes/settings/Billing/components/BillingUsageSection.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import type { Plan as ModelPlan } from '@/server/api/proto/app/v1/common';
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import SettingsRow from '../components/SettingsRow.vue';
import PaymentHistory from './components/PaymentHistory';
import PlanSelection from './components/PlanSelection';
import UpgradePlan from './components/UpgradePlan';

const auth = useAuthStore();

const { refetch: refetchUsage } = useUsageQuery();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);

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

const openTopupDialog = () => {
    topupAmount.value = null;
    topupDialogVisible.value = true;
};

</script>

<template>
    <SettingsSectionCard :title="$t('settings.content.billing.title')"
        :description="$t('settings.content.billing.subtitle')">
        <SettingsRow :title="$t('settings.billing.walletBalance')"
            :description="$t('settings.billing.currentBalance', { balance: auth.formatMoney(walletBalance) })"
            iconBoxClass="bg-primary/10">
            <template #icon>
                <CoinsIcon filled class="w-5 h-5 text-primary" />
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

    <BillingTopupDialog v-model="topupDialogVisible" />

    <UpgradePlan
        :visible="upgradeDialogVisible"
        :selected-plan="selectedPlan"
        @update:visible="handleUpgradeVisibilityChange"
        @close="closeUpgradeDialog"
        @success="handleUpgradeSuccess"
    />
</template>
