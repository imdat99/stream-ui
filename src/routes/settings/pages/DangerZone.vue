<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangle.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import SlidersIcon from '@/components/icons/SlidersIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

const handleDeleteAccount = () => {
    confirm.require({
        message: t('settings.dangerZone.confirm.deleteAccountMessage'),
        header: t('settings.dangerZone.confirm.deleteAccountHeader'),
        acceptLabel: t('settings.dangerZone.confirm.deleteAccountAccept'),
        rejectLabel: t('settings.dangerZone.confirm.deleteAccountReject'),
        accept: () => {
            toast.add({
                severity: 'info',
                summary: t('settings.dangerZone.toast.deleteAccountSummary'),
                detail: t('settings.dangerZone.toast.deleteAccountDetail'),
                life: 5000,
            });
        },
    });
};

const handleClearData = () => {
    confirm.require({
        message: t('settings.dangerZone.confirm.clearDataMessage'),
        header: t('settings.dangerZone.confirm.clearDataHeader'),
        acceptLabel: t('settings.dangerZone.confirm.clearDataAccept'),
        rejectLabel: t('settings.dangerZone.confirm.clearDataReject'),
        accept: () => {
            toast.add({
                severity: 'info',
                summary: t('settings.dangerZone.toast.clearDataSummary'),
                detail: t('settings.dangerZone.toast.clearDataDetail'),
                life: 5000,
            });
        },
    });
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-danger">{{ t('settings.content.danger.title') }}</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                {{ t('settings.content.danger.subtitle') }}
            </p>
        </div>

        <div class="divide-y divide-border">
            <div class="flex items-center justify-between px-6 py-4 hover:bg-danger/5 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
                        <AlertTriangleIcon class="w-5 h-5 text-danger" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.dangerZone.deleteAccount.title') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.dangerZone.deleteAccount.description') }}
                        </p>
                    </div>
                </div>
                <AppButton variant="danger" size="sm" @click="handleDeleteAccount">
                    <template #icon>
                        <TrashIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.dangerZone.deleteAccount.button') }}
                </AppButton>
            </div>

            <div class="flex items-center justify-between px-6 py-4 hover:bg-danger/5 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.dangerZone.clearData.title') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ t('settings.dangerZone.clearData.description') }}
                        </p>
                    </div>
                </div>
                <AppButton variant="danger" size="sm" @click="handleClearData">
                    <template #icon>
                        <SlidersIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.dangerZone.clearData.button') }}
                </AppButton>
            </div>
        </div>

        <div class="mx-6 my-4 border border-warning/30 bg-warning/5 rounded-md p-4">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-warning mt-0.5" />
                <div class="text-xs text-foreground/70">
                    <p class="font-medium text-foreground mb-1">{{ t('settings.dangerZone.warning.title') }}</p>
                    <p>
                        {{ t('settings.dangerZone.warning.description') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
