<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';

const auth = useAuthStore();
const toast = useToast();

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
const handleToggle2FA = async () => {
    if (!twoFactorEnabled.value) {
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
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Security & Connected Accounts</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Manage your security settings and connected services.
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
                        <p class="text-sm font-medium text-foreground">Account Status</p>
                        <p class="text-xs text-foreground/60 mt-0.5">Your account is in good standing</p>
                    </div>
                </div>
                <span class="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">Active</span>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <LockIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ twoFactorEnabled ? '2FA is enabled' : 'Add an extra layer of security' }}
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="twoFactorEnabled" @change="handleToggle2FA" />
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
                        <p class="text-sm font-medium text-foreground">Change Password</p>
                        <p class="text-xs text-foreground/60 mt-0.5">Update your account password</p>
                    </div>
                </div>
                <Button
                    label="Change Password"
                    @click="openChangePassword"
                    size="small"
                    class="press-animated"
                />
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
                        <p class="text-sm font-medium text-foreground">Email</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ emailConnected ? 'Connected' : 'Not connected' }}
                        </p>
                    </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded" :class="emailConnected ? 'text-success bg-success/10' : 'text-muted bg-muted/20'">
                    {{ emailConnected ? 'Connected' : 'Disconnected' }}
                </span>
            </div>

            <!-- Telegram Connection -->
            <div class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-md bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                        <TelegramIcon class="w-5 h-5 text-[#0088cc]" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Telegram</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ telegramConnected ? (telegramUsername || 'Connected') : 'Get notified via Telegram' }}
                        </p>
                    </div>
                </div>
                <Button
                    v-if="telegramConnected"
                    label="Disconnect"
                    size="small"
                    text
                    severity="danger"
                    @click="disconnectTelegram"
                    class="press-animated"
                />
                <Button
                    v-else
                    label="Connect"
                    size="small"
                    @click="connectTelegram"
                    class="press-animated"
                />
            </div>
        </div>

        <!-- 2FA Setup Dialog -->
        <Dialog
            v-model:visible="twoFactorDialogVisible"
            modal
            header="Enable Two-Factor Authentication"
            :style="{ width: '26rem' }"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
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
                    <p class="text-xs text-foreground/60 mb-1">Secret Key:</p>
                    <code class="text-sm font-mono text-primary">{{ twoFactorSecret }}</code>
                </div>

                <!-- Verification Code Input -->
                <div class="grid gap-2">
                    <label for="twoFactorCode" class="text-sm font-medium text-foreground">Verification Code</label>
                    <InputText
                        id="twoFactorCode"
                        v-model="twoFactorCode"
                        placeholder="Enter 6-digit code"
                        maxlength="6"
                        class="w-full"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button
                        label="Cancel"
                        text
                        severity="secondary"
                        @click="twoFactorDialogVisible = false"
                        class="press-animated"
                    />
                    <Button
                        label="Verify & Enable"
                        @click="confirmTwoFactor"
                        class="press-animated"
                    />
                </div>
            </template>
        </Dialog>

        <!-- Change Password Dialog -->
        <Dialog
            :visible="changePasswordDialogVisible"
            @update:visible="changePasswordDialogVisible = $event"
            modal
            header="Change Password"
            :style="{ width: '26rem' }"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    Enter your current password and choose a new password.
                </p>

                <!-- Error Message -->
                <div v-if="changePasswordError" class="bg-danger/10 border border-danger text-danger text-sm rounded-md p-3">
                    {{ changePasswordError }}
                </div>

                <!-- Current Password -->
                <div class="grid gap-2">
                    <label for="currentPassword" class="text-sm font-medium text-foreground">Current Password</label>
                    <IconField>
                        <InputIcon>
                            <LockIcon class="w-5 h-5" />
                        </InputIcon>
                        <InputText
                            id="currentPassword"
                            v-model="currentPassword"
                            type="password"
                            placeholder="Enter current password"
                            class="w-full"
                        />
                    </IconField>
                </div>

                <!-- New Password -->
                <div class="grid gap-2">
                    <label for="newPassword" class="text-sm font-medium text-foreground">New Password</label>
                    <IconField>
                        <InputIcon>
                            <LockIcon class="w-5 h-5" />
                        </InputIcon>
                        <InputText
                            id="newPassword"
                            v-model="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            class="w-full"
                        />
                    </IconField>
                </div>

                <!-- Confirm Password -->
                <div class="grid gap-2">
                    <label for="confirmPassword" class="text-sm font-medium text-foreground">Confirm New Password</label>
                    <IconField>
                        <InputIcon>
                            <LockIcon class="w-5 h-5" />
                        </InputIcon>
                        <InputText
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            class="w-full"
                        />
                    </IconField>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button
                        label="Cancel"
                        text
                        severity="secondary"
                        @click="changePasswordDialogVisible = false"
                        :disabled="changePasswordLoading"
                        class="press-animated"
                    />
                    <Button
                        label="Change Password"
                        @click="changePassword"
                        :loading="changePasswordLoading"
                        class="press-animated"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>
