<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    dialogVisible: boolean;
    error: string;
    loading: boolean;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    emailConnected: boolean;
    telegramConnected: boolean;
    telegramUsername: string;
}>();

const emit = defineEmits<{
    (e: 'update:dialogVisible', value: boolean): void;
    (e: 'update:currentPassword', value: string): void;
    (e: 'update:newPassword', value: string): void;
    (e: 'update:confirmPassword', value: string): void;
    (e: 'close'): void;
    (e: 'change-password'): void;
    (e: 'connect-telegram'): void;
    (e: 'disconnect-telegram'): void;
}>();

const { t } = useI18n();

const handleChangePassword = () => {
    emit('change-password');
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold text-foreground mb-3">{{ t('settings.connectedAccounts.title') }}</h3>
        </div>

        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.connectedAccounts.email.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ emailConnected ? t('settings.connectedAccounts.email.connected') : t('settings.connectedAccounts.email.notConnected') }}
                        </p>
                    </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                    {{ emailConnected ? t('settings.connectedAccounts.email.connected') : t('settings.connectedAccounts.email.disconnected') }}
                </span>
            </div>

            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                        <TelegramIcon class="w-5 h-5 text-[#0088cc]" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.connectedAccounts.telegram.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ telegramConnected ? (telegramUsername || t('settings.connectedAccounts.telegram.connectedFallback')) : t('settings.connectedAccounts.telegram.hint') }}
                        </p>
                    </div>
                </div>
                <AppButton
                    v-if="telegramConnected"
                    variant="danger"
                    size="sm"
                    @click="$emit('disconnect-telegram')"
                >
                    {{ t('common.disconnect') }}
                </AppButton>
                <AppButton
                    v-else
                    size="sm"
                    @click="$emit('connect-telegram')"
                >
                    {{ t('common.connect') }}
                </AppButton>
            </div>
        </div>

        <AppDialog
            :visible="dialogVisible"
            @update:visible="$emit('update:dialogVisible', $event)"
            :title="t('settings.securityConnected.changePassword.dialog.title')"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    {{ t('settings.securityConnected.changePassword.dialog.subtitle') }}
                </p>

                <div v-if="error" class="bg-danger/10 border border-danger text-danger text-sm rounded-md p-3">
                    {{ error }}
                </div>

                <div class="grid gap-2">
                    <label for="currentPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.current') }}</label>
                    <AppInput
                        id="currentPassword"
                        :model-value="currentPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.currentPlaceholder')"
                        @update:model-value="$emit('update:currentPassword', $event)"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <div class="grid gap-2">
                    <label for="newPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.new') }}</label>
                    <AppInput
                        id="newPassword"
                        :model-value="newPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.newPlaceholder')"
                        @update:model-value="$emit('update:newPassword', $event)"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <div class="grid gap-2">
                    <label for="confirmPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.confirm') }}</label>
                    <AppInput
                        id="confirmPassword"
                        :model-value="confirmPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.confirmPlaceholder')"
                        @update:model-value="$emit('update:confirmPassword', $event)"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <AppButton
                        variant="secondary"
                        size="sm"
                        :disabled="loading"
                        @click="$emit('close')"
                    >
                        <template #icon>
                            <XIcon class="w-4 h-4" />
                        </template>
                        {{ t('common.cancel') }}
                    </AppButton>
                    <AppButton
                        size="sm"
                        :loading="loading"
                        @click="handleChangePassword"
                    >
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        {{ t('settings.securityConnected.changePassword.dialog.submit') }}
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
