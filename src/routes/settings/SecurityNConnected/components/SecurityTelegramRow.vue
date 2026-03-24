<script setup lang="ts">
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    telegramConnected: boolean;
    telegramUsername: string;
}>();

const emit = defineEmits<{
    (e: 'connect'): void;
    (e: 'disconnect'): void;
}>();

const { t } = useTranslation();
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.telegram.label')"
        :description="telegramConnected ? (telegramUsername || t('settings.securityConnected.telegram.connectedFallback')) : t('settings.securityConnected.telegram.detailDisconnected')"
    >
        <template #icon>
            <TelegramIcon class="w-6 h-6 text-[#0088cc]" />
        </template>

        <template #actions>
            <AppButton
                v-if="telegramConnected"
                variant="danger"
                size="sm"
                @click="emit('disconnect')"
            >
                {{ t('settings.securityConnected.telegram.disconnect') }}
            </AppButton>
            <AppButton
                v-else
                size="sm"
                variant="secondary"
                @click="emit('connect')"
            >
                {{ t('settings.securityConnected.telegram.connect') }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
