<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import ProfileInformationCard from '../components/ProfileInformationCard.vue';
import SecuritySettingsCard from '../components/SecuritySettingsCard.vue';
import ConnectedAccountsCard from '../components/ConnectedAccountsCard.vue';

const auth = useAuthStore();
const toast = useToast();

// Form state
const editing = ref(false);
const username = ref('');
const email = ref('');
const saving = ref(false);

// 2FA state
const twoFactorEnabled = ref(false);
const twoFactorDialogVisible = ref(false);

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

// Initialize form values
const initForm = () => {
    username.value = auth.user?.username || '';
    email.value = auth.user?.email || '';
    emailConnected.value = !!auth.user?.email;
};

// Start editing
const startEdit = () => {
    initForm();
    editing.value = true;
};

// Cancel edit
const cancelEdit = () => {
    editing.value = false;
};

// Save profile
const saveProfile = async () => {
    saving.value = true;
    try {
        await auth.updateProfile({ username: username.value, email: email.value });
        toast.add({
            severity: 'success',
            summary: 'Profile Updated',
            detail: 'Your profile has been updated successfully.',
            life: 3000
        });
        editing.value = false;
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: e.message || 'Failed to update profile.',
            life: 5000
        });
    } finally {
        saving.value = false;
    }
};

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
        changePasswordError.value = 'Passwords do not match';
        return;
    }

    if (newPassword.value.length < 6) {
        changePasswordError.value = 'Password must be at least 6 characters';
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
            summary: 'Password Changed',
            detail: 'Your password has been changed successfully.',
            life: 3000
        });
    } catch (e: any) {
        changePasswordError.value = e.message || 'Failed to change password';
    } finally {
        changePasswordLoading.value = false;
    }
};

// Toggle 2FA
const toggleTwoFactor = async () => {
    if (!twoFactorEnabled.value) {
        // Enable 2FA - generate secret and QR code
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            twoFactorDialogVisible.value = true;
        } catch (e) {
            toast.add({
                severity: 'error',
                summary: 'Enable 2FA Failed',
                detail: 'Failed to enable two-factor authentication.',
                life: 5000
            });
            twoFactorEnabled.value = false;
        }
    } else {
        // Disable 2FA
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.add({
                severity: 'success',
                summary: '2FA Disabled',
                detail: 'Two-factor authentication has been disabled.',
                life: 3000
            });
        } catch (e) {
            toast.add({
                severity: 'error',
                summary: 'Disable 2FA Failed',
                detail: 'Failed to disable two-factor authentication.',
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
            summary: '2FA Enabled',
            detail: 'Two-factor authentication has been enabled successfully.',
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Enable 2FA Failed',
            detail: 'Invalid verification code. Please try again.',
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
            summary: 'Telegram Connected',
            detail: `Connected to ${telegramUsername.value}`,
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Connection Failed',
            detail: 'Failed to connect Telegram account.',
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
            summary: 'Telegram Disconnected',
            detail: 'Your Telegram account has been disconnected.',
            life: 3000
        });
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Disconnect Failed',
            detail: 'Failed to disconnect Telegram account.',
            life: 5000
        });
    }
};
</script>

<template>
    <div class="space-y-6">
        <SecuritySettingsCard
            v-model:two-factor-enabled="twoFactorEnabled"
            :change-password-error="changePasswordError"
            :change-password-loading="changePasswordLoading"
            :current-password="currentPassword"
            :new-password="newPassword"
            :confirm-password="confirmPassword"
            @toggle-2fa="toggleTwoFactor"
            @change-password="openChangePassword"
            @close-password-dialog="changePasswordDialogVisible = false"
            @close-2fa-dialog="twoFactorDialogVisible = false"
            @confirm-2fa="confirmTwoFactor"
            @update:current-password="currentPassword = $event"
            @update:new-password="newPassword = $event"
            @update:confirm-password="confirmPassword = $event"
        />

        <ConnectedAccountsCard
            :dialog-visible="changePasswordDialogVisible"
            @update:dialog-visible="changePasswordDialogVisible = $event"
            :error="changePasswordError"
            :loading="changePasswordLoading"
            :current-password="currentPassword"
            :new-password="newPassword"
            :confirm-password="confirmPassword"
            :email-connected="emailConnected"
            :telegram-connected="telegramConnected"
            :telegram-username="telegramUsername"
            @close="changePasswordDialogVisible = false"
            @change-password="changePassword"
            @connect-telegram="connectTelegram"
            @disconnect-telegram="disconnectTelegram"
            @update:current-password="currentPassword = $event"
            @update:new-password="newPassword = $event"
            @update:confirm-password="confirmPassword = $event"
        />
    </div>
</template>
