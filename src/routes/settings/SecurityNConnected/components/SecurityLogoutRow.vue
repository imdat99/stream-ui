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
    >
        <template #icon>
            <XCircleIcon class="w-6 h-6 text-danger" />
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
