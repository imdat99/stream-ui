<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import XCircleIcon from '@/components/icons/XCircleIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { supportedLocales } from '@/i18n/constants';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';

const auth = useAuthStore();
const toast = useAppToast();
const confirm = useAppConfirm();
const { t, i18next } = useTranslation();

const languageSaving = ref(false);
const selectedLanguage = ref<string>(auth.user?.language || "en");
const languageOptions = computed(() => supportedLocales.map((value) => ({
    value,
    label: t(`settings.securityConnected.language.options.${value}`)
})));

const twoFactorEnabled = ref(false);
const twoFactorDialogVisible = ref(false);
const twoFactorCode = ref('');
const twoFactorSecret = ref('JBSWY3DPEHPK3PXP');

const emailConnected = ref(true);
const telegramConnected = ref(false);
const telegramUsername = ref('');

const changePasswordDialogVisible = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changePasswordLoading = ref(false);
const changePasswordError = ref('');

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
    <SettingsSectionCard
        :title="t('settings.securityConnected.header.title')"
        :description="t('settings.securityConnected.header.subtitle')"
    >
        <SettingsRow
            :title="t('settings.securityConnected.accountStatus.label')"
            :description="t('settings.securityConnected.accountStatus.detail')"
            iconBoxClass="bg-success/10"
        >
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </template>

            <template #actions>
                <span class="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">{{ t('settings.securityConnected.accountStatus.badge') }}</span>
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.securityConnected.language.label')"
            :description="t('settings.securityConnected.language.detail')"
            iconBoxClass="bg-info/10"
            actionsClass="flex items-center gap-2"
        >
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15 15 0 0 1 0 20" />
                    <path d="M12 2a15 15 0 0 0 0 20" />
                </svg>
            </template>

            <template #actions>
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
            </template>
        </SettingsRow>

         <SettingsRow
            :title="t('settings.securityConnected.twoFactor.label')"
            :description="twoFactorEnabled ? t('settings.securityConnected.twoFactor.enabled') : t('settings.securityConnected.twoFactor.disabled')"
            iconBoxClass="bg-primary/10"
        >
            <template #icon>
                <LockIcon class="w-5 h-5 text-primary" />
            </template>

            <template #actions>
                <AppSwitch v-model="twoFactorEnabled" @change="handleToggle2FA" />
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.securityConnected.changePassword.label')"
            :description="t('settings.securityConnected.changePassword.detail')"
            iconBoxClass="bg-primary/10"
        >
            <template #icon>
                <svg aria-hidden="true" class="fill-primary" height="24" viewBox="0 0 24 24" version="1.1" width="24" data-view-component="true">
                    <path d="M22 9.75v5.5A1.75 1.75 0 0 1 20.25 17H3.75A1.75 1.75 0 0 1 2 15.25v-5.5C2 8.784 2.784 8 3.75 8h16.5c.966 0 1.75.784 1.75 1.75Zm-8.75 2.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Zm-6.5 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm10.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"></path>
                </svg>
            </template>

            <template #actions>
                <AppButton size="sm" @click="openChangePassword">
                    {{ t('settings.securityConnected.changePassword.button') }}
                </AppButton>
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.securityConnected.email.label')"
            :description="emailConnected ? t('settings.securityConnected.email.connected') : t('settings.securityConnected.email.disconnected')"
            iconBoxClass="bg-info/10"
        >
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
            </template>

            <template #actions>
                <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                    {{ emailConnected ? t('settings.securityConnected.email.badgeConnected') : t('settings.securityConnected.email.badgeDisconnected') }}
                </span>
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.securityConnected.telegram.label')"
            :description="telegramConnected ? (telegramUsername || t('settings.securityConnected.telegram.connectedFallback')) : t('settings.securityConnected.telegram.detailDisconnected')"
            iconBoxClass="bg-[#0088cc]/10"
        >
            <template #icon>
                <TelegramIcon class="w-5 h-5 text-[#0088cc]" />
            </template>

            <template #actions>
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
            </template>
        </SettingsRow>

        <SettingsRow
            :title="t('settings.securityConnected.logout.label')"
            :description="t('settings.securityConnected.logout.detail')"
            iconBoxClass="bg-danger/10"
            hoverClass="hover:bg-danger/5"
        >
            <template #icon>
                <XCircleIcon class="w-5 h-5 text-danger" />
            </template>

            <template #actions>
                <AppButton variant="danger" size="sm" @click="handleLogout">
                    <template #icon>
                        <XCircleIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.securityConnected.logout.button') }}
                </AppButton>
            </template>
        </SettingsRow>
    </SettingsSectionCard>

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

            <div class="bg-muted/30 rounded-md p-3">
                <p class="text-xs text-foreground/60 mb-1">{{ t('settings.securityConnected.twoFactorDialog.secret') }}</p>
                <code class="text-sm font-mono text-primary">{{ twoFactorSecret }}</code>
            </div>

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

            <div v-if="changePasswordError" class="bg-danger/10 border border-danger text-danger text-sm rounded-md p-3">
                {{ changePasswordError }}
            </div>

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
</template>
