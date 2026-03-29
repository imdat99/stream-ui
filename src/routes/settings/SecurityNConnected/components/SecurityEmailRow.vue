<script setup lang="ts">
import MailIcon from '@/components/icons/MailIcon.vue';
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
        iconBoxClass="bg-primary/10 text-primary"
    >
        <template #icon>
            <MailIcon filled />
        </template>

        <template #actions>
            <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                {{ emailConnected ? t('settings.securityConnected.email.badgeConnected') : t('settings.securityConnected.email.badgeDisconnected') }}
            </span>
        </template>
    </SettingsRow>
</template>
