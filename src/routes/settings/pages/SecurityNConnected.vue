<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import XCircleIcon from '@/components/icons/XCircleIcon.vue';
import { supportedLocales, type SupportedLocale } from '@/i18n/constants';
import { normalizeLocale } from '@/i18n';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useI18n();

const selectedLanguage = ref<SupportedLocale>(normalizeLocale((auth.user as any)?.language ?? (auth.user as any)?.locale));
const languageSaving = ref(false);

const languageOptions = computed(() => supportedLocales.map((value) => ({
    value,
    label: t(`settings.securityConnected.language.options.${value}`)
})));

watch(() => auth.user, (nextUser) => {
    selectedLanguage.value = normalizeLocale((nextUser as any)?.language ?? (nextUser as any)?.locale);
}, { deep: true });

// 2FA state
const twoFactorEnabled = ref(false);
const twoFactorDialogVisible = ref(false);
const twoFactorCode = ref('');
const twoFactorSecret = ref('JBSWY3DPEHPK3PXP');

// Connected accounts state
const emailConnected = ref(true);
const telegramConnected = ref(false);
const telegramUsername = ref('');

// Change password state
const changePasswordDialogVisible = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changePasswordLoading = ref(false);
const changePasswordError = ref('');

// Change password handler
const openChangePassword = () => {
    changePasswordDialogVisible.value = true;
    changePasswordError.value = '';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
};

const changePassword = async () => {
    changePasswordError.value = '';

    if (newPassword.value !== confirmPassword.value) {
        changePasswordError.value = t('settings.securityConnected.changePassword.dialog.errors.mismatch');
        return;
    }

    if (newPassword.value.length < 6) {
        changePasswordError.value = t('settings.securityConnected.changePassword.dialog.errors.minLength');
        return;
    }

    changePasswordLoading.value = true;
    try {
        await auth.changePassword(currentPassword.value, newPassword.value);
        changePasswordDialogVisible.value = false;
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        toast.add({
            severity: 'success',
            summary: t('settings.securityConnected.changePassword.toast.successSummary'),
            detail: t('settings.securityConnected.changePassword.toast.successDetail'),
            life: 3000
        });
    } catch (e: any) {
        changePasswordError.value = e.message || t('settings.securityConnected.changePassword.dialog.errors.default');
    } finally {
        changePasswordLoading.value = false;
    }
};

const handleLogout = () => {
    confirm.require({
        message: t('settings.securityConnected.logout.confirm.message'),
        header: t('settings.securityConnected.logout.confirm.header'),
        acceptLabel: t('settings.securityConnected.logout.confirm.accept'),
        rejectLabel: t('settings.securityConnected.logout.confirm.reject'),
        accept: async () => {
            await auth.logout();
        }
    });
};

const saveLanguage = async () => {
    languageSaving.value = true;
    try {
        const result = await auth.setLanguage(selectedLanguage.value);
        if (result.ok && !result.fallbackOnly) {
            toast.add({
                severity: 'success',
                summary: t('settings.securityConnected.language.toast.successSummary'),
                detail: t('settings.securityConnected.language.toast.successDetail'),
                life: 3000,
            });
            return;
        }

        toast.add({
            severity: 'warn',
            summary: t('settings.securityConnected.language.toast.errorSummary'),
            detail: t('settings.securityConnected.language.toast.errorDetail'),
            life: 5000,
        });
    } finally {
        languageSaving.value = false;
    }
};

// Toggle 2FA
const handleToggle2FA = async () => {
    if (!twoFactorEnabled.value) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            twoFactorDialogVisible.value = true;
        } catch (e) {
            toast.add({
                severity: 'error',
                summary: t('settings.securityConnected.toast.twoFactorEnableFailedSummary'),
                detail: t('settings.securityConnected.toast.twoFactorEnableFailedDetail'),
                life: 5000
            });
            twoFactorEnabled.value = false;
        }
    } else {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.add({
                severity: 'success',
                summary: t('settings.securityConnected.toast.twoFactorDisabledSummary'),
                detail: t('settings.securityConnected.toast.twoFactorDisabledDetail'),
                life: 3000
            });
        } catch (e) {
            toast.add({
                severity: 'error',
                summary: t('settings.securityConnected.toast.twoFactorDisableFailedSummary'),
                detail: t('settings.securityConnected.toast.twoFactorDisableFailedDetail'),
                life: 5000
            });
            twoFactorEnabled.value = true;
        }
    }
};

// Confirm 2FA setup
const confirmTwoFactor = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        twoFactorEnabled.value = true;
        toast.add({
            severity: 'success',
            summary: t('settings.securityConnected.toast.twoFactorEnabledSummary'),
            detail: t('settings.securityConnected.toast.twoFactorEnabledDetail'),
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('settings.securityConnected.toast.twoFactorInvalidCodeSummary'),
            detail: t('settings.securityConnected.toast.twoFactorInvalidCodeDetail'),
            life: 5000
        });
    }
};

// Connect Telegram
const connectTelegram = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        telegramConnected.value = true;
        telegramUsername.value = '@telegram_user';
        toast.add({
            severity: 'success',
            summary: t('settings.securityConnected.toast.telegramConnectedSummary'),
            detail: t('settings.securityConnected.toast.telegramConnectedDetail', { username: telegramUsername.value }),
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('settings.securityConnected.toast.telegramConnectFailedSummary'),
            detail: t('settings.securityConnected.toast.telegramConnectFailedDetail'),
            life: 5000
        });
    }
};

// Disconnect Telegram
const disconnectTelegram = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        telegramConnected.value = false;
        telegramUsername.value = '';
        toast.add({
            severity: 'info',
            summary: t('settings.securityConnected.toast.telegramDisconnectedSummary'),
            detail: t('settings.securityConnected.toast.telegramDisconnectedDetail'),
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('settings.securityConnected.toast.telegramDisconnectFailedSummary'),
            detail: t('settings.securityConnected.toast.telegramDisconnectFailedDetail'),
            life: 5000
        });
    }
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">{{ t('settings.securityConnected.header.title') }}</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                {{ t('settings.securityConnected.header.subtitle') }}
            </p>
        </div>

        <!-- Content -->
        <div class="divide-y divide-border">
            <!-- Account Status -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.accountStatus.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ t('settings.securityConnected.accountStatus.detail') }}</p>
                    </div>
                </div>
                <span class="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">{{ t('settings.securityConnected.accountStatus.badge') }}</span>
            </div>

            <!-- Language -->
            <div class="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <path d="M12 2a15 15 0 0 1 0 20" />
                            <path d="M12 2a15 15 0 0 0 0 20" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.language.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ t('settings.securityConnected.language.detail') }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <select
                        v-model="selectedLanguage"
                        :disabled="languageSaving"
                        class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground disabled:opacity-60"
                    >
                        <option
                            v-for="option in languageOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                    <AppButton
                        size="sm"
                        :loading="languageSaving"
                        :disabled="languageSaving"
                        @click="saveLanguage"
                    >
                        {{ t('settings.securityConnected.language.save') }}
                    </AppButton>
                </div>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <LockIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.twoFactor.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ twoFactorEnabled ? t('settings.securityConnected.twoFactor.enabled') : t('settings.securityConnected.twoFactor.disabled') }}
                        </p>
                    </div>
                </div>
                <AppSwitch v-model="twoFactorEnabled" @change="handleToggle2FA" />
            </div>

            <!-- Change Password -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <svg aria-hidden="true" class="fill-primary" height="24" viewBox="0 0 24 24" version="1.1" width="24" data-view-component="true">
                            <path d="M22 9.75v5.5A1.75 1.75 0 0 1 20.25 17H3.75A1.75 1.75 0 0 1 2 15.25v-5.5C2 8.784 2.784 8 3.75 8h16.5c.966 0 1.75.784 1.75 1.75Zm-8.75 2.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Zm-6.5 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm10.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ t('settings.securityConnected.changePassword.detail') }}</p>
                    </div>
                </div>
                <AppButton size="sm" @click="openChangePassword">
                    {{ t('settings.securityConnected.changePassword.button') }}
                </AppButton>
            </div>

            <!-- Logout -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-danger/5 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
                        <XCircleIcon class="w-5 h-5 text-danger" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.logout.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ t('settings.securityConnected.logout.detail') }}</p>
                    </div>
                </div>
                <AppButton variant="danger" size="sm" @click="handleLogout">
                    <template #icon>
                        <XCircleIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.securityConnected.logout.button') }}
                </AppButton>
            </div>

            <!-- Email Connection -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.email.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ emailConnected ? t('settings.securityConnected.email.connected') : t('settings.securityConnected.email.disconnected') }}
                        </p>
                    </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                    {{ emailConnected ? t('settings.securityConnected.email.badgeConnected') : t('settings.securityConnected.email.badgeDisconnected') }}
                </span>
            </div>

            <!-- Telegram Connection -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                        <TelegramIcon class="w-5 h-5 text-[#0088cc]" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.telegram.label') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ telegramConnected ? (telegramUsername || t('settings.securityConnected.telegram.connectedFallback')) : t('settings.securityConnected.telegram.detailDisconnected') }}
                        </p>
                    </div>
                </div>
                <AppButton
                    v-if="telegramConnected"
                    variant="danger"
                    size="sm"
                    @click="disconnectTelegram"
                >
                    {{ t('settings.securityConnected.telegram.disconnect') }}
                </AppButton>
                <AppButton
                    v-else
                    size="sm"
                    @click="connectTelegram"
                >
                    {{ t('settings.securityConnected.telegram.connect') }}
                </AppButton>
            </div>
        </div>

        <!-- 2FA Setup Dialog -->
        <AppDialog
            :visible="twoFactorDialogVisible"
            @update:visible="twoFactorDialogVisible = $event"
            :title="t('settings.securityConnected.twoFactorDialog.title')"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    {{ t('settings.securityConnected.twoFactorDialog.subtitle') }}
                </p>

                <!-- QR Code Placeholder -->
                <div class="flex justify-center py-4">
                    <div class="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                    </div>
                </div>

                <!-- Secret Key -->
                <div class="bg-muted/30 rounded-md p-3">
                    <p class="text-xs text-foreground/60 mb-1">{{ t('settings.securityConnected.twoFactorDialog.secret') }}</p>
                    <code class="text-sm font-mono text-primary">{{ twoFactorSecret }}</code>
                </div>

                <!-- Verification Code Input -->
                <div class="grid gap-2">
                    <label for="twoFactorCode" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.twoFactorDialog.codeLabel') }}</label>
                    <AppInput
                        id="twoFactorCode"
                        v-model="twoFactorCode"
                        :placeholder="t('settings.securityConnected.twoFactorDialog.codePlaceholder')"
                        :maxlength="6"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <AppButton variant="secondary" size="sm" @click="twoFactorDialogVisible = false">
                        {{ t('settings.securityConnected.twoFactorDialog.cancel') }}
                    </AppButton>
                    <AppButton size="sm" @click="confirmTwoFactor">
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        {{ t('settings.securityConnected.twoFactorDialog.verify') }}
                    </AppButton>
                </div>
            </template>
        </AppDialog>

        <!-- Change Password Dialog -->
        <AppDialog
            :visible="changePasswordDialogVisible"
            @update:visible="changePasswordDialogVisible = $event"
            :title="t('settings.securityConnected.changePassword.dialog.title')"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    {{ t('settings.securityConnected.changePassword.dialog.subtitle') }}
                </p>

                <!-- Error Message -->
                <div v-if="changePasswordError" class="bg-danger/10 border border-danger text-danger text-sm rounded-md p-3">
                    {{ changePasswordError }}
                </div>

                <!-- Current Password -->
                <div class="grid gap-2">
                    <label for="currentPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.current') }}</label>
                    <AppInput
                        id="currentPassword"
                        v-model="currentPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.currentPlaceholder')"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <!-- New Password -->
                <div class="grid gap-2">
                    <label for="newPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.new') }}</label>
                    <AppInput
                        id="newPassword"
                        v-model="newPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.newPlaceholder')"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <!-- Confirm Password -->
                <div class="grid gap-2">
                    <label for="confirmPassword" class="text-sm font-medium text-foreground">{{ t('settings.securityConnected.changePassword.dialog.confirm') }}</label>
                    <AppInput
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        :placeholder="t('settings.securityConnected.changePassword.dialog.confirmPlaceholder')"
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
                        :disabled="changePasswordLoading"
                        @click="changePasswordDialogVisible = false"
                    >
                        {{ t('settings.securityConnected.changePassword.dialog.cancel') }}
                    </AppButton>
                    <AppButton
                        size="sm"
                        :loading="changePasswordLoading"
                        @click="changePassword"
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
