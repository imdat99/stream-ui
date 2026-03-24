<template>
    <ClientOnly>
        <AppTopLoadingBar />
        <OfflineOverlay />
    </ClientOnly>
    <router-view />
</template>
<script setup lang="ts">
import ClientOnly from '@/components/ClientOnly';
import AppTopLoadingBar from '@/components/AppTopLoadingBar.vue'
import OfflineOverlay from '@/components/OfflineOverlay.vue'
</script>
