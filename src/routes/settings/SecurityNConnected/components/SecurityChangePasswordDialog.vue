<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LockIcon from '@/components/icons/LockIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    visible: boolean;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    loading: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:currentPassword', value: string): void;
    (e: 'update:newPassword', value: string): void;
    (e: 'update:confirmPassword', value: string): void;
    (e: 'submit'): void;
}>();

const { t } = useTranslation();

const normalizeValue = (value: string | number | null) => typeof value === 'string' ? value : value == null ? '' : String(value);
</script>

<template>
    <AppDialog
        :visible="visible"
        :title="t('settings.securityConnected.changePassword.dialog.title')"
        maxWidthClass="max-w-md"
        @update:visible="emit('update:visible', $event)"
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
                    @update:model-value="emit('update:currentPassword', normalizeValue($event))"
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
                    @update:model-value="emit('update:newPassword', normalizeValue($event))"
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
                    @update:model-value="emit('update:confirmPassword', normalizeValue($event))"
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
                    @click="emit('update:visible', false)"
                >
                    {{ t('settings.securityConnected.changePassword.dialog.cancel') }}
                </AppButton>
                <AppButton
                    size="sm"
                    :loading="loading"
                    @click="emit('submit')"
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
