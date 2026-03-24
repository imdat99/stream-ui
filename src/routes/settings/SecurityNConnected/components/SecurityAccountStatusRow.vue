<script setup lang="ts">
import { useTranslation } from 'i18next-vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.accountStatus.label')"
        :description="t('settings.securityConnected.accountStatus.detail')"
    >
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        </template>

        <template #actions>
            <span class="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">{{ t('settings.securityConnected.accountStatus.badge') }}</span>
        </template>
    </SettingsRow>
</template>
