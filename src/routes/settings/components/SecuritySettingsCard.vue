<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';

const props = defineProps<{
    twoFactorEnabled: boolean;
    changePasswordError: string;
    changePasswordLoading: boolean;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>();

const emit = defineEmits<{
    (e: 'update:twoFactorEnabled', value: boolean): void;
    (e: 'update:currentPassword', value: string): void;
    (e: 'update:newPassword', value: string): void;
    (e: 'update:confirmPassword', value: string): void;
    (e: 'toggle-2fa'): void;
    (e: 'change-password'): void;
    (e: 'close-password-dialog'): void;
    (e: 'close-2fa-dialog'): void;
    (e: 'confirm-2fa'): void;
}>();

const twoFactorDialogVisible = ref(false);
const twoFactorCode = ref('');
const twoFactorSecret = ref('JBSWY3DPEHPK3PXP');

const handleToggle2FA = async () => {
    if (!props.twoFactorEnabled) {
        twoFactorDialogVisible.value = true;
    } else {
        emit('toggle-2fa');
    }
};

const confirmTwoFactor = async () => {
    emit('confirm-2fa');
    twoFactorDialogVisible.value = false;
    twoFactorCode.value = '';
};
// (kept minimal; no dynamic items list needed)

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
        <div class="p-6 space-y-4">
            <!-- Account Status -->
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
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
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <LockIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ twoFactorEnabled ? '2FA is enabled' : 'Add an extra layer of security' }}
                        </p>
                    </div>
                </div>
                <AppSwitch
                    :model-value="twoFactorEnabled"
                    @update:model-value="emit('update:twoFactorEnabled', $event)"
                    @change="handleToggle2FA"
                />
            </div>
            <!-- Change Password -->
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <svg aria-hidden="true" class="fill-primary" height="24" viewBox="0 0 24 24" version="1.1" width="24" data-view-component="true">
    <path d="M22 9.75v5.5A1.75 1.75 0 0 1 20.25 17H3.75A1.75 1.75 0 0 1 2 15.25v-5.5C2 8.784 2.784 8 3.75 8h16.5c.966 0 1.75.784 1.75 1.75Zm-8.75 2.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Zm-6.5 1.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm10.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"></path>
</svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Change Password</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Update your account password
                        </p>
                    </div>
                </div>
                <AppButton size="sm" @click="$emit('change-password')">
                    Change Password
                </AppButton>
            </div>
        </div>

        <!-- 2FA Setup Dialog -->
        <AppDialog
            :visible="twoFactorDialogVisible"
            @update:visible="twoFactorDialogVisible = $event"
            title="Enable Two-Factor Authentication"
            maxWidthClass="max-w-md"
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
                    <AppInput
                        id="twoFactorCode"
                        v-model="twoFactorCode"
                        placeholder="Enter 6-digit code"
                        :maxlength="6"
                    />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-3">
                    <AppButton variant="secondary" size="sm" @click="twoFactorDialogVisible = false">
                        <template #icon>
                            <XIcon class="w-4 h-4" />
                        </template>
                        Cancel
                    </AppButton>
                    <AppButton size="sm" @click="confirmTwoFactor">
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        Verify & Enable
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
