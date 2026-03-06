<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import BellIcon from '@/components/icons/BellIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import MailIcon from '@/components/icons/MailIcon.vue';
import SendIcon from '@/components/icons/SendIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import { useAppToast } from '@/composables/useAppToast';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { computed, ref } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const { t } = useTranslation();

const notificationSettings = ref({
    email: true,
    push: true,
    marketing: false,
    telegram: false,
});

const saving = ref(false);

const notificationTypes = computed(() => [
    {
        key: 'email' as const,
        title: t('settings.notificationSettings.types.email.title'),
        description: t('settings.notificationSettings.types.email.description'),
        icon: MailIcon,
        bgColor: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        key: 'push' as const,
        title: t('settings.notificationSettings.types.push.title'),
        description: t('settings.notificationSettings.types.push.description'),
        icon: BellIcon,
        bgColor: 'bg-accent/10',
        iconColor: 'text-accent',
    },
    {
        key: 'marketing' as const,
        title: t('settings.notificationSettings.types.marketing.title'),
        description: t('settings.notificationSettings.types.marketing.description'),
        icon: SendIcon,
        bgColor: 'bg-info/10',
        iconColor: 'text-info',
    },
    {
        key: 'telegram' as const,
        title: t('settings.notificationSettings.types.telegram.title'),
        description: t('settings.notificationSettings.types.telegram.description'),
        icon: TelegramIcon,
        bgColor: 'bg-info/10',
        iconColor: 'text-info',
    },
]);

const handleSave = async () => {
    saving.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.add({
            severity: 'success',
            summary: t('settings.notificationSettings.toast.savedSummary'),
            detail: t('settings.notificationSettings.toast.savedDetail'),
            life: 3000,
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: t('settings.notificationSettings.toast.failedSummary'),
            detail: e.message || t('settings.notificationSettings.toast.failedDetail'),
            life: 5000,
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <SettingsSectionCard
        :title="t('settings.content.notifications.title')"
        :description="t('settings.content.notifications.subtitle')"
    >
        <template #header-actions>
            <AppButton size="sm" :loading="saving" @click="handleSave">
                <template #icon>
                    <CheckIcon class="w-4 h-4" />
                </template>
                {{ t('settings.notificationSettings.saveChanges') }}
            </AppButton>
        </template>

        <SettingsRow
            v-for="type in notificationTypes"
            :key="type.key"
            :title="type.title"
            :description="type.description"
            :iconBoxClass="type.bgColor"
        >
            <template #icon>
                <component :is="type.icon" :class="[type.iconColor, 'w-5 h-5']" />
            </template>

            <template #actions>
                <AppSwitch v-model="notificationSettings[type.key]" />
            </template>
        </SettingsRow>
    </SettingsSectionCard>
</template>
