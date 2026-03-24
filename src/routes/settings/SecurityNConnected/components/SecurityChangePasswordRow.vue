<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import { useTranslation } from 'i18next-vue';

const emit = defineEmits<{
    (e: 'open'): void;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.changePassword.label')"
        :description="t('settings.securityConnected.changePassword.detail')"
    >
        <template #icon>
            <svg aria-hidden="true" class="fill-primary w-6 h-6" height="24" viewBox="0 0 24 24" version="1.1" width="24" data-view-component="true">
                <path d="M22 9.75v5.5A1.75 1.75 0 0 1 20.25 17H3.75A1.75 1.75 0 0 1 2 15.25v-5.5C2 8.784 2.784 8 3.75 8h16.5c.966 0 1.75.784 1.75 1.75Zm-8.75 2.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Zm-6.5 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm10.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"></path>
            </svg>
        </template>

        <template #actions>
            <AppButton variant="secondary" size="sm" @click="emit('open')">
                {{ t('settings.securityConnected.changePassword.button') }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
