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
        iconBoxClass="bg-primary/10 text-primary"
    >
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 404 564"><path d="M74 138v64h64v-64c0-35 29-64 64-64s64 29 64 64v64h64v-64c0-71-57-128-128-128S74 67 74 138z" fill="var(--fill1)"/><path d="M74 202c-35 0-64 29-64 64v224c0 35 29 64 64 64h256c35 0 64-29 64-64V266c0-35-29-64-64-64H74zm152 136v80c0 13-11 24-24 24s-24-11-24-24v-80c0-13 11-24 24-24s24 11 24 24z" fill="var(--fill4)"/></svg>
        </template>

        <template #actions>
            <AppButton variant="secondary" size="sm" @click="emit('open')">
                {{ t('settings.securityConnected.changePassword.button') }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
