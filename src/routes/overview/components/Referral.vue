<template>
    <div class="rounded-xl border border-gray-300 hover:border-primary hover:shadow-lg text-card-foreground bg-surface">
        <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="text-lg font-semibold leading-none tracking-tight">{{ t('overview.referral.title') }}</h3>
        </div>
        <div class="p-6 pt-0 space-y-4">
            <p class="text-sm text-gray-600 font-medium">{{ t('overview.referral.subtitle') }}</p>
            <div class="flex gap-2">
                <AppInput class="w-full" readonly type="text" :modelValue="url" @click="copyToClipboard" />
                <button class="btn btn-primary" @click="copyToClipboard" :disabled="isCopied" :aria-label="t('common.copy')">
                    <svg v-if="!isCopied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-check" aria-hidden="true">
                        <path d="M22 11.02V12a10 10 0 1 1-5.93-9.14"></path>
                        <path d="M22 4L12 14.01l-3-3"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const isCopied = ref(false);
const { t } = useI18n();

const url = computed(() => `${location.origin}/ref/${auth.user?.username || ''}`);

const copyToClipboard = ($event: MouseEvent) => {
    if ($event.target instanceof HTMLInputElement) {
        $event.target.select();
    }

    navigator.clipboard.writeText(url.value);
    isCopied.value = true;

    setTimeout(() => {
        isCopied.value = false;
    }, 3000);
};
</script>
