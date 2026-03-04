<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';

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

const handleChangePassword = () => {
    emit('change-password');
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h3 class="text-sm font-semibold text-foreground mb-3">Connected Accounts</h3>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
            <!-- Email Connection -->
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center shrink-0">
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
            <div class="flex items-center justify-between p-4 rounded-md bg-muted/30">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                        <TelegramIcon class="w-5 h-5 text-[#0088cc]" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Telegram</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            {{ telegramConnected ? (telegramUsername || 'Connected') : 'Get notified via Telegram' }}
                        </p>
                    </div>
                </div>
                <AppButton
                    v-if="telegramConnected"
                    variant="danger"
                    size="sm"
                    @click="$emit('disconnect-telegram')"
                >
                    Disconnect
                </AppButton>
                <AppButton
                    v-else
                    size="sm"
                    @click="$emit('connect-telegram')"
                >
                    Connect
                </AppButton>
            </div>
        </div>

        <!-- Change Password Dialog -->
        <AppDialog
            :visible="dialogVisible"
            @update:visible="$emit('update:dialogVisible', $event)"
            title="Change Password"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <p class="text-sm text-foreground/70">
                    Enter your current password and choose a new password.
                </p>

                <!-- Error Message -->
                <div v-if="error" class="bg-danger/10 border border-danger text-danger text-sm rounded-md p-3">
                    {{ error }}
                </div>

                <!-- Current Password -->
                <div class="grid gap-2">
                    <label for="currentPassword" class="text-sm font-medium text-foreground">Current Password</label>
                    <AppInput
                        id="currentPassword"
                        :model-value="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        @update:model-value="$emit('update:currentPassword', $event)"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <!-- New Password -->
                <div class="grid gap-2">
                    <label for="newPassword" class="text-sm font-medium text-foreground">New Password</label>
                    <AppInput
                        id="newPassword"
                        :model-value="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        @update:model-value="$emit('update:newPassword', $event)"
                    >
                        <template #prefix>
                            <LockIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>

                <!-- Confirm Password -->
                <div class="grid gap-2">
                    <label for="confirmPassword" class="text-sm font-medium text-foreground">Confirm New Password</label>
                    <AppInput
                        id="confirmPassword"
                        :model-value="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
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
                        Cancel
                    </AppButton>
                    <AppButton
                        size="sm"
                        :loading="loading"
                        @click="handleChangePassword"
                    >
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        Change Password
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
