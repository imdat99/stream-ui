<script setup lang="ts">
import { useTranslation } from 'i18next-vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.accountStatus.label')"
        :description="t('settings.securityConnected.accountStatus.detail')"
        iconBoxClass="bg-primary/10 text-primary"
    >
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 532 532"><path d="M10 266c0 37 21 69 51 85-10 33-2 70 24 96s63 34 96 24c16 30 48 51 85 51s69-21 85-51c33 10 70 2 96-24s34-63 24-96c30-16 51-48 51-85s-21-69-51-85c10-33 2-70-24-96s-63-34-96-24c-16-30-48-51-85-51s-69 21-85 51c-33-10-70-2-96 24s-34 63-24 96c-30 16-51 48-51 85zm136 24 34-33c8 8 26 26 53 54l106-145 14-20 39 28-14 20-123 169-17 23-20-21c-43-45-68-70-72-75z" fill="var(--fill1)"/><path d="m392 174-14 20-123 169-17 23-20-21c-43-45-68-70-72-75l34-33c8 8 26 26 53 54l106-145 14-20 39 28z" fill="var(--fill4)"/></svg>
        </template>

        <template #actions>
            <span class="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">{{ t('settings.securityConnected.accountStatus.badge') }}</span>
        </template>
    </SettingsRow>
</template>
