<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import AppSwitch from '@/components/ui/AppSwitch.vue';
import BellIcon from '@/components/icons/BellIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import MailIcon from '@/components/icons/MailIcon.vue';
import SendIcon from '@/components/icons/SendIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import {
    createNotificationSettingsDraft,
    toNotificationPreferencesPayload,
    useSettingsPreferencesQuery,
} from '@/composables/useSettingsPreferencesQuery';
import { useAppToast } from '@/composables/useAppToast';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import SettingsRowSkeleton from '@/routes/settings/components/SettingsRowSkeleton.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const { t } = useTranslation();

const { data: preferencesSnapshot, error, isPending, refetch } = useSettingsPreferencesQuery();

const notificationSettings = ref(createNotificationSettingsDraft());
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

const isInitialLoading = computed(() => isPending.value && !preferencesSnapshot.value);
const isInteractionDisabled = computed(() => saving.value || isInitialLoading.value || !preferencesSnapshot.value);

watch(preferencesSnapshot, (snapshot) => {
    if (!snapshot) return;
    notificationSettings.value = createNotificationSettingsDraft(snapshot);
}, { immediate: true });

watch(error, (value, previous) => {
    if (!value || value === previous || saving.value) return;

    toast.add({
        severity: 'error',
        summary: t('settings.notificationSettings.toast.failedSummary'),
        detail: (value as any)?.message || t('settings.notificationSettings.toast.failedDetail'),
        life: 5000,
    });
});

const handleSave = async () => {
    if (saving.value || !preferencesSnapshot.value) return;

    saving.value = true;
    try {
        await rpcClient.updatePreferences(
            toNotificationPreferencesPayload(notificationSettings.value),
        );
        await refetch();

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
            <AppButton size="sm" :loading="saving" :disabled="isInitialLoading || !preferencesSnapshot" @click="handleSave">
                <template #icon>
                    <CheckIcon class="w-4 h-4" />
                </template>
                {{ t('settings.notificationSettings.saveChanges') }}
            </AppButton>
        </template>

        <template v-if="isInitialLoading">
            <SettingsRowSkeleton
                v-for="type in notificationTypes"
                :key="type.key"
            />
        </template>

        <template v-else>
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
                    <AppSwitch v-model="notificationSettings[type.key]" :disabled="isInteractionDisabled" />
                </template>
            </SettingsRow>
        </template>
    </SettingsSectionCard>
</template>
