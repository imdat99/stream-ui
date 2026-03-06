<template>
    <div class="text-3xl font-bold text-gray-900 mb-1">
        <span class=":uno: bg-[linear-gradient(130deg,#14a74b_0%,#22c55e_35%,#10b981_65%,#06b6d4_100%)] bg-clip-text text-transparent">{{ $t('overview.welcome.title', { name: auth.user?.username || t('app.name') }) }}</span>
    </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';

const auth = useAuthStore();
</script>
