<script setup lang="ts">
import { client } from '@/api/rpcclient';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useUsageQuery } from '@/composables/useUsageQuery';
import { getApiErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';

const visible = defineModel<boolean>();
const toast = useAppToast();
const auth = useAuthStore();
const { t } = useTranslation();
const { refetch: refetchUsage } = useUsageQuery();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);
const topupLoading = ref(false);
const topupPresets = [10, 20, 50, 100];

const refreshBillingState = async () => {
    await Promise.allSettled([
        auth.fetchMe(),
        refetchUsage(),
    ]);
};

const handleTopup = async (amount: number) => {
    topupLoading.value = true;
    try {
        await client.topupWallet({ amount });
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
        visible.value = false;
    }
};

</script>

<template>
    <AppDialog
        :visible="visible!"
        @update:visible="visible = $event"
        :title="$t('settings.billing.topupDialog.title')"
        maxWidthClass="max-w-md"
    >
        <div class="space-y-4">
            <p class="text-sm text-foreground/70">
                {{ $t('settings.billing.topupDialog.subtitle') }}
            </p>

            <div class="grid grid-cols-4 gap-3">
                <button
                    v-for="preset in topupPresets"
                    :key="preset"
                    :class="[
                        'py-2 px-3 rounded-md bg-header text-sm font-medium transition-all hover:bg-gray-500',
                        topupAmount === preset
                            ? 'bg-primary text-white'
                            : 'bg-muted/50 text-foreground hover:bg-muted'
                    ]"
                    @click="topupAmount = preset"
                >
                    ${{ preset }}
                </button>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">{{ $t('settings.billing.topupDialog.customAmount') }}</label>
                <div class="flex items-center gap-2">
                    <span class="text-lg font-semibold text-foreground">$</span>
                    <AppInput
                        :model-value="topupAmount"
                        type="number"
                        :placeholder="$t('settings.billing.topupDialog.enterAmount')"
                        inputClass="flex-1"
                        min="1"
                        step="1"
                        @update:model-value="topupAmount = typeof $event === 'number' || $event === null
                            ? $event
                            : ($event === '' ? null : Number($event))"
                    />
                </div>
            </div>

            <div class="bg-muted/30 rounded-md p-3 text-xs text-foreground/60">
                <p>{{ $t('settings.billing.topupDialog.hint') }}</p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <AppButton
                    variant="secondary"
                    size="sm"
                    :disabled="topupLoading"
                    @click="visible = false; topupAmount = null"
                >
                    {{ $t('common.cancel') }}
                </AppButton>
                <AppButton
                    size="sm"
                    :loading="topupLoading"
                    :disabled="!topupAmount || topupAmount < 1 || topupLoading"
                    @click="handleTopup(topupAmount!)"
                >
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ $t('settings.billing.topupDialog.proceed') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
