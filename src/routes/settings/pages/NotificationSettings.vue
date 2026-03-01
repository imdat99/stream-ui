<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import MailIcon from '@/components/icons/MailIcon.vue';
import BellIcon from '@/components/icons/BellIcon.vue';
import SendIcon from '@/components/icons/SendIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';

const toast = useToast();

const notificationSettings = ref({
    email: true,
    push: true,
    marketing: false,
    telegram: false,
});

const saving = ref(false);

const notificationTypes = [
    {
        key: 'email' as const,
        title: 'Email Notifications',
        description: 'Receive updates and alerts via email',
        icon: MailIcon,
        bgColor: 'bg-primary/10',
        iconColor: 'text-primary',
    },
    {
        key: 'push' as const,
        title: 'Push Notifications',
        description: 'Get instant alerts in your browser',
        icon: BellIcon,
        bgColor: 'bg-accent/10',
        iconColor: 'text-accent',
    },
    {
        key: 'marketing' as const,
        title: 'Marketing Emails',
        description: 'Receive promotions and product updates',
        icon: SendIcon,
        bgColor: 'bg-info/10',
        iconColor: 'text-info',
    },
    {
        key: 'telegram' as const,
        title: 'Telegram Notifications',
        description: 'Receive updates via Telegram',
        icon: TelegramIcon,
        bgColor: 'bg-info/10',
        iconColor: 'text-info',
    },
];

const handleSave = async () => {
    saving.value = true;
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.add({
            severity: 'success',
            summary: 'Settings Saved',
            detail: 'Your notification settings have been saved.',
            life: 3000
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: e.message || 'Failed to save settings.',
            life: 5000
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">Notifications</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    Choose how you want to receive notifications and updates.
                </p>
            </div>
            <Button
                label="Save Changes"
                icon="pi pi-check"
                size="small"
                :loading="saving"
                @click="handleSave"
                class="press-animated"
            />
        </div>

        <!-- Content -->
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
                <ToggleSwitch v-model="notificationSettings[type.key]" />
            </div>
        </div>
    </div>
</template>
