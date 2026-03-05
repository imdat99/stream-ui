<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from '@/components/app/AppButton.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppProgressBar from '@/components/app/AppProgressBar.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import MailIcon from '@/components/icons/MailIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';

const auth = useAuthStore();
const { t } = useI18n();

const props = defineProps<{
    editing: boolean;
    username: string;
    email: string;
    saving: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:username', value: string): void;
    (e: 'update:email', value: string): void;
    (e: 'start-edit'): void;
    (e: 'cancel-edit'): void;
    (e: 'save'): void;
    (e: 'change-password'): void;
}>();

const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240);

const storagePercentage = computed(() =>
    Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100)
);

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">{{ t('settings.profile.title') }}</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                {{ t('settings.profile.subtitle') }}
            </p>
        </div>

        <div class="p-6 space-y-6">
            <div class="flex items-center gap-4 pb-4 border-b border-border">
                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon class="w-8 h-8 text-primary" :filled="true" />
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-foreground">{{ auth.user?.username || t('settings.profile.userFallback') }}</h3>
                    <p class="text-sm text-foreground/60">{{ auth.user?.email || '' }}</p>
                </div>
            </div>

            <div class="grid gap-6 max-w-2xl">
                <div class="grid gap-2">
                    <label for="username" class="text-sm font-medium text-foreground">{{ t('settings.profile.username') }}</label>
                    <AppInput
                        id="username"
                        :model-value="username"
                        :readonly="!editing"
                        :inputClass="editing ? 'bg-surface' : 'bg-muted/30'"
                        @update:model-value="emit('update:username', String($event))"
                    >
                        <template #prefix>
                            <UserIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>
                <div class="grid gap-2">
                    <label for="email" class="text-sm font-medium text-foreground">{{ t('settings.profile.email') }}</label>
                    <AppInput
                        id="email"
                        :model-value="email"
                        :readonly="!editing"
                        :inputClass="editing ? 'bg-surface' : 'bg-muted/30'"
                        @update:model-value="emit('update:email', $event || '')"
                    >
                        <template #prefix>
                            <MailIcon class="w-5 h-5" />
                        </template>
                    </AppInput>
                </div>
            </div>

            <div class="pt-4 border-t border-border">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" x2="12" y1="3" y2="15"/>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-foreground">{{ t('settings.profile.storageUsage') }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ t('settings.profile.storageUsedOfLimit', { used: formatBytes(storageUsed), limit: formatBytes(storageLimit) }) }}</p>
                    </div>
                    <span class="text-sm font-semibold text-foreground">{{ storagePercentage }}%</span>
                </div>
                <AppProgressBar :value="storagePercentage" />
            </div>
        </div>

        <div class="px-6 py-4 bg-muted/30 border-t border-border flex items-center gap-3">
            <template v-if="editing">
                <AppButton size="sm" :loading="saving" @click="emit('save')">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ t('common.save') }}
                </AppButton>
                <AppButton variant="secondary" size="sm" :disabled="saving" @click="emit('cancel-edit')">
                    <template #icon>
                        <XIcon class="w-4 h-4" />
                    </template>
                    {{ t('common.cancel') }}
                </AppButton>
            </template>
            <template v-else>
                <AppButton size="sm" @click="emit('start-edit')">
                    <template #icon>
                        <PencilIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.profile.editProfile') }}
                </AppButton>
                <AppButton variant="secondary" size="sm" @click="emit('change-password')">
                    {{ t('settings.profile.changePassword') }}
                </AppButton>
            </template>
        </div>
    </div>
</template>
