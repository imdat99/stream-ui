<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

const auth = useAuthStore();
const { t } = useI18n();
</script>

<template>
    <div class="bg-gradient-to-r to-success/20 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-success/30 mb-8">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            {{ t('overview.welcome.title', { name: auth.user?.username || t('app.name') }) }}
        </h1>
        <p class="text-sm sm:text-base text-gray-600 font-medium">{{ t('overview.welcome.subtitle') }}</p>
    </div>
</template>
