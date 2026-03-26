<script setup lang="ts">
import XCircleIcon from '@/components/icons/XCircleIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import { useTranslation } from 'i18next-vue';

const emit = defineEmits<{
    (e: 'logout'): void;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.logout.label')"
        :description="t('settings.securityConnected.logout.detail')"
        hoverClass="hover:bg-danger/5"
        iconBoxClass="bg-danger/10 text-danger"
    >
        <template #icon>
            <svg class="w-6 h-6 text-danger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 532 532"><path d="M10 266c0 141 115 256 256 256s256-115 256-256S407 10 266 10 10 125 10 266zm167-89c9-9 25-9 34 0l55 55 55-55c9-9 25-9 34 0s9 25 0 34l-55 55 55 55c9 9 9 25 0 34-10 9-25 9-34 0l-55-55-55 55c-9 9-25 9-34 0-9-10-9-25 0-34l55-55-55-55c-9-9-9-25 0-34z" fill="color-mix(in srgb, var(--colors-danger-DEFAULT) 40%, transparent)"/><path d="M211 177c-9-9-25-9-34 0s-9 25 0 34l55 55-55 55c-9 9-9 25 0 34 10 9 25 9 34 0l55-55 55 55c9 9 25 9 34 0 9-10 9-25 0-34l-55-55 55-55c9-9 9-25 0-34s-25-9-34 0l-55 55-55-55z" fill="var(--colors-danger-DEFAULT)"/></svg>
        </template>

        <template #actions>
            <AppButton variant="danger" size="sm" @click="emit('logout')">
                <template #icon>
                    <XCircleIcon class="w-4 h-4" />
                </template>
                {{ t('settings.securityConnected.logout.button') }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
