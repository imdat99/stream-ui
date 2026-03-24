<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    visible: boolean;
    twoFactorCode: string;
    twoFactorSecret: string;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:twoFactorCode', value: string): void;
    (e: 'confirm'): void;
}>();

const { t } = useTranslation();

const updateCode = (value: string | number | null) => {
    emit('update:twoFactorCode', typeof value === 'string' ? value : value == null ? '' : String(value));
};
</script>

<template>
    <AppDialog
        :visible="visible"
        :title="t('settings.securityConnected.twoFactorDialog.title')"
        maxWidthClass="max-w-md"
        @update:visible="emit('update:visible', $event)"
    >
        <div class="space-y-4">
            <p class="text-sm text-foreground/70">
                {{ t('settings.securityConnected.twoFactorDialog.subtitle') }}
            </p>

            <div class="flex justify-center py-4">
                <div class="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
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
                    :model-value="twoFactorCode"
                    :placeholder="t('settings.securityConnected.twoFactorDialog.codePlaceholder')"
                    :maxlength="6"
                    @update:model-value="updateCode"
                />
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3">
                <AppButton variant="secondary" size="sm" @click="emit('update:visible', false)">
                    {{ t('settings.securityConnected.twoFactorDialog.cancel') }}
                </AppButton>
                <AppButton size="sm" @click="emit('confirm')">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.securityConnected.twoFactorDialog.verify') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
