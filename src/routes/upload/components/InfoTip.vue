<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-info h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
        </svg>
        <div class="flex-1 text-sm">
            <p class="font-medium text-blue-900 dark:text-blue-100 mb-1">{{ t('upload.infoTip.title') }}</p>
            <p class="text-blue-800 dark:text-blue-200">{{ t('upload.infoTip.description') }}</p>
        </div>
    </div>
</template>
