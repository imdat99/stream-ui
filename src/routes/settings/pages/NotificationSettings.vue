<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import BellIcon from '@/components/icons/BellIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import MailIcon from '@/components/icons/MailIcon.vue';
import SendIcon from '@/components/icons/SendIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const toast = useAppToast();
const { t } = useI18n();

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
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">{{ t('settings.content.notifications.title') }}</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    {{ t('settings.content.notifications.subtitle') }}
                </p>
            </div>
            <AppButton
                size="sm"
                :loading="saving"
                @click="handleSave"
            >
                <template #icon>
                    <CheckIcon class="w-4 h-4" />
                </template>
                {{ t('settings.notificationSettings.saveChanges') }}
            </AppButton>
        </div>

        <div class="divide-y divide-border">
            <div
                v-for="type in notificationTypes"
                :key="type.key"
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        :class="`:uno: w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${type.bgColor}`"
                    >
                        <component :is="type.icon" :class="`${type.iconColor} w-5 h-5`" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ type.title }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ type.description }}</p>
                    </div>
                </div>
                <AppSwitch v-model="notificationSettings[type.key]" />
            </div>
        </div>
    </div>
</template>
