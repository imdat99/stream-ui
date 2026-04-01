<template>
    <div>
        <PageHeader title="Analytics"
            description="Your streaming analytics will be displayed here."
            :breadcrumbs="breadcrumbs" />
        <div class="p-6 rounded-xl border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Coming Soon</h2>
            <p class="text-gray-600">We are working hard to bring you detailed analytics about your streams. Stay tuned!</p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useTranslation } from 'i18next-vue';

const {t} = useTranslation()
const breadcrumbs = computed(() => [
    { label: t('pageHeader.dashboard'), to: '/overview' },
    { label: t('pageHeader.settings'), to: '/settings' },
    { label: "Analytics"}
    // ...(currentItem.value ? [{ label: currentItem.value.label + (currentItem.value.value.includes("admin") ? " (Admin)" : "") }] : []),
]);
</script>