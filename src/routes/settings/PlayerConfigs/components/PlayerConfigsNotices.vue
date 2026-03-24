<script setup lang="ts">
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    isFreePlan: boolean;
    isFreeReconciliationMode: boolean;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsNotice class="rounded-none border-x-0 border-t-0 p-3" contentClass="text-xs text-foreground/70">
        {{ t('settings.playerConfigs.infoBanner') }}
    </SettingsNotice>

    <SettingsNotice
        v-if="isFreePlan"
        tone="warning"
        :title="t(isFreeReconciliationMode ? 'settings.playerConfigs.reconciliationTitle' : 'settings.playerConfigs.freePlanTitle')"
        class="rounded-none border-x-0 border-t-0 p-3"
        contentClass="text-xs text-foreground/70"
    >
        {{ t(isFreeReconciliationMode ? 'settings.playerConfigs.reconciliationMessage' : 'settings.playerConfigs.freePlanMessage') }}
    </SettingsNotice>
</template>
