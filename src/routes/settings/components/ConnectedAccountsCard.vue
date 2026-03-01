<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import LockIcon from '@/components/icons/LockIcon.vue';
import TelegramIcon from '@/components/icons/TelegramIcon.vue';

const toast = useToast();

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
                <Button
                    v-if="telegramConnected"
                    label="Disconnect"
                    size="small"
                    text
                    severity="danger"
                    @click="$emit('disconnect-telegram')"
                    class="press-animated"
                />
                <Button
                    v-else
                    label="Connect"
                    size="small"
                    @click="$emit('connect-telegram')"
                    class="press-animated"
                />
            </div>
        </div>

        <!-- Change Password Dialog -->
        <Dialog
            :visible="dialogVisible"
            @update:visible="$emit('update:dialogVisible', $event)"
            modal
            header="Change Password"
            :style="{ width: '26rem' }"
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
                    <IconField>
                        <InputIcon>
                            <LockIcon class="w-5 h-5" />
                        </InputIcon>
                        <InputText
                            id="currentPassword"
                            :model-value="currentPassword"
                            type="password"
                            placeholder="Enter current password"
                            class="w-full"
                            @update:model-value="$emit('update:currentPassword', $event)"
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
                            :model-value="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            class="w-full"
                            @update:model-value="$emit('update:newPassword', $event)"
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
                            :model-value="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            class="w-full"
                            @update:model-value="$emit('update:confirmPassword', $event)"
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
                        @click="$emit('close')"
                        :disabled="loading"
                        class="press-animated"
                    />
                    <Button
                        label="Change Password"
                        @click="handleChangePassword"
                        :loading="loading"
                        class="press-animated"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>
