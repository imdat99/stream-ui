<script setup lang="ts">
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    emailConnected: boolean;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.email.label')"
        :description="emailConnected ? t('settings.securityConnected.email.connected') : t('settings.securityConnected.email.disconnected')"
    >
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="text-info w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        </template>

        <template #actions>
            <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                {{ emailConnected ? t('settings.securityConnected.email.badgeConnected') : t('settings.securityConnected.email.badgeDisconnected') }}
            </span>
        </template>
    </SettingsRow>
</template>
