<script setup lang="ts">
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { supportedLocales } from '@/i18n/constants';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';
import SecurityAccountStatusRow from './components/SecurityAccountStatusRow.vue';
import SecurityChangePasswordDialog from './components/SecurityChangePasswordDialog.vue';
import SecurityChangePasswordRow from './components/SecurityChangePasswordRow.vue';
import SecurityEmailRow from './components/SecurityEmailRow.vue';
import SecurityLanguageRow from './components/SecurityLanguageRow.vue';
import SecurityLogoutRow from './components/SecurityLogoutRow.vue';
import SecurityTelegramRow from './components/SecurityTelegramRow.vue';
import SecurityTwoFactorDialog from './components/SecurityTwoFactorDialog.vue';

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
    // https://t.me/<username_bot>?start=abc123
    window.open(`https://t.me/hlstiktok_bot?start=${auth.user?.username}`, "_blank");
    // try {
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     telegramConnected.value = true;
    //     telegramUsername.value = '@telegram_user';
    //     toast.add({
    //         severity: 'success',
    //         summary: t('settings.securityConnected.toast.telegramConnectedSummary'),
    //         detail: t('settings.securityConnected.toast.telegramConnectedDetail', { username: telegramUsername.value }),
    //         life: 3000
    //     });
    // } catch (e) {
    //     toast.add({
    //         severity: 'error',
    //         summary: t('settings.securityConnected.toast.telegramConnectFailedSummary'),
    //         detail: t('settings.securityConnected.toast.telegramConnectFailedDetail'),
    //         life: 5000
    //     });
    // }
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
        <SecurityAccountStatusRow />

        <SecurityLanguageRow
            :selected-language="selectedLanguage"
            :language-options="languageOptions"
            :language-saving="languageSaving"
            @update:selected-language="selectedLanguage = $event"
            @save="saveLanguage"
        />

        <SecurityChangePasswordRow @open="openChangePassword" />

        <SecurityEmailRow :email-connected="emailConnected" />

        <SecurityTelegramRow
            :telegram-connected="telegramConnected"
            :telegram-username="telegramUsername"
            @connect="connectTelegram"
            @disconnect="disconnectTelegram"
        />

        <SecurityLogoutRow @logout="handleLogout" />
    </SettingsSectionCard>

    <SecurityTwoFactorDialog
        :visible="twoFactorDialogVisible"
        :two-factor-code="twoFactorCode"
        :two-factor-secret="twoFactorSecret"
        @update:visible="twoFactorDialogVisible = $event"
        @update:two-factor-code="twoFactorCode = $event"
        @confirm="confirmTwoFactor"
    />

    <SecurityChangePasswordDialog
        :visible="changePasswordDialogVisible"
        :current-password="currentPassword"
        :new-password="newPassword"
        :confirm-password="confirmPassword"
        :loading="changePasswordLoading"
        :error="changePasswordError"
        @update:visible="changePasswordDialogVisible = $event"
        @update:current-password="currentPassword = $event"
        @update:new-password="newPassword = $event"
        @update:confirm-password="confirmPassword = $event"
        @submit="changePassword"
    />
</template>
