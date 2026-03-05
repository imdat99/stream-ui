<template>
    <vue-head :input="{ title: t('notFound.headTitle') }" />
    <div class="mx-auto text-center mt-20 flex flex-col items-center gap-4">
        <h1>{{ t('notFound.title') }}</h1>
        <p>{{ t('notFound.description') }}</p>
        <router-link class="btn btn-primary" to="/">{{ t('notFound.backHome') }}</router-link>
    </div>
</template>

<script setup lang="ts">
import { VueHead } from '@/components/VueHead';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
