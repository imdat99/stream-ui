<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangle.vue';
import SlidersIcon from '@/components/icons/SlidersIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

const deletingAccount = ref(false);
const clearingData = ref(false);

const handleDeleteAccount = () => {
    confirm.require({
        message: t('settings.dangerZone.confirm.deleteAccountMessage'),
        header: t('settings.dangerZone.confirm.deleteAccountHeader'),
        acceptLabel: t('settings.dangerZone.confirm.deleteAccountAccept'),
        rejectLabel: t('settings.dangerZone.confirm.deleteAccountReject'),
        accept: async () => {
            deletingAccount.value = true;
            try {
                await rpcClient.deleteMe();

                auth.$reset();
                toast.add({
                    severity: 'success',
                    summary: t('settings.dangerZone.toast.deleteAccountSummary'),
                    detail: t('settings.dangerZone.toast.deleteAccountDetail'),
                    life: 5000,
                });
                await router.push('/login');
            } catch (e: any) {
                console.error(e);
                toast.add({
                    severity: 'error',
                    summary: t('settings.dangerZone.toast.failedSummary'),
                    detail: e.message || t('settings.dangerZone.toast.failedDetail'),
                    life: 5000,
                });
            } finally {
                deletingAccount.value = false;
            }
        },
    });
};

const handleClearData = () => {
    confirm.require({
        message: t('settings.dangerZone.confirm.clearDataMessage'),
        header: t('settings.dangerZone.confirm.clearDataHeader'),
        acceptLabel: t('settings.dangerZone.confirm.clearDataAccept'),
        rejectLabel: t('settings.dangerZone.confirm.clearDataReject'),
        accept: async () => {
            clearingData.value = true;
            try {
                await rpcClient.clearMyData();

                await auth.fetchMe();
                toast.add({
                    severity: 'success',
                    summary: t('settings.dangerZone.toast.clearDataSummary'),
                    detail: t('settings.dangerZone.toast.clearDataDetail'),
                    life: 5000,
                });
            } catch (e: any) {
                console.error(e);
                toast.add({
                    severity: 'error',
                    summary: t('settings.dangerZone.toast.failedSummary'),
                    detail: e.message || t('settings.dangerZone.toast.failedDetail'),
                    life: 5000,
                });
            } finally {
                clearingData.value = false;
            }
        },
    });
};
</script>

<template>
    <SettingsSectionCard
        :title="t('settings.content.danger.title')"
        :description="t('settings.content.danger.subtitle')"
        titleClass="text-base font-semibold text-danger"
    >
        <SettingsRow
            :title="t('settings.dangerZone.deleteAccount.title')"
            :description="t('settings.dangerZone.deleteAccount.description')"
            iconBoxClass="bg-danger/10"
            hoverClass="hover:bg-danger/5"
        >
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-danger" viewBox="-10 -258 532 532"><path d="M256 264c141 0 256-115 256-256S397-248 256-248 0-133 0 8s115 256 256 256zM416-24v64H96v-64h320z" fill="currentColor"/></svg>
            </template>

            <template #actions>
                <AppButton variant="danger" size="sm" :loading="deletingAccount" :disabled="clearingData" @click="handleDeleteAccount">
                    {{ t('settings.dangerZone.deleteAccount.button') }}
                </AppButton>
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.dangerZone.clearData.title')"
            :description="t('settings.dangerZone.clearData.description')"
            iconBoxClass="bg-danger/10"
            hoverClass="hover:bg-danger/5"
        >
            <template #icon>
                <TrashIcon filled class="w-5 h-5 text-danger" />
            </template>

            <template #actions>
                <AppButton variant="danger" size="sm" :loading="clearingData" :disabled="deletingAccount" @click="handleClearData">
                    {{ t('settings.dangerZone.clearData.button') }}
                </AppButton>
            </template>
        </SettingsRow>

        <SettingsNotice tone="warning" class="mx-6 my-4 border-warning/30">
            <p class="font-medium text-foreground mb-1">{{ t('settings.dangerZone.warning.title') }}</p>
            <p>{{ t('settings.dangerZone.warning.description') }}</p>
        </SettingsNotice>
    </SettingsSectionCard>
</template>
