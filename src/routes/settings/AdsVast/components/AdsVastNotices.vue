<script setup lang="ts">
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    isFreePlan: boolean;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsNotice class="rounded-none border-x-0 border-t-0 p-3" contentClass="text-xs text-foreground/70">
        {{ t('settings.adsVast.infoBanner') }}
    </SettingsNotice>

    <SettingsNotice
        v-if="isFreePlan"
        tone="warning"
        :title="t('settings.adsVast.readOnlyTitle')"
        class="rounded-none border-x-0 border-t-0 p-3"
        contentClass="text-xs text-foreground/70"
    >
        {{ t('settings.adsVast.readOnlyMessage') }}
    </SettingsNotice>
</template>
