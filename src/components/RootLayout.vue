<template>
    <ClientOnly>
        <AppTopLoadingBar />
    </ClientOnly>
    <router-view/>
</template>
<script setup lang="ts">
import ClientOnly from '@/components/ClientOnly';
import AppTopLoadingBar from '@/components/AppTopLoadingBar.vue'
</script>
