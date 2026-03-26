<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 548"><path d="M42 122v352c0 35 29 64 64 64h256c35 0 64-29 64-64V122H42zm64 88c0-13 11-24 24-24s24 11 24 24v240c0 13-11 24-24 24s-24-11-24-24V210zm104 0c0-13 11-24 24-24s24 11 24 24v240c0 13-11 24-24 24s-24-11-24-24V210zm104 0c0-13 11-24 24-24s24 11 24 24v240c0 13-11 24-24 24s-24-11-24-24V210z" fill="color-mix(in srgb, var(--colors-danger-DEFAULT) 40%, transparent)"/><path d="M177 10c-14 0-26 9-30 22l-9 26H42c-18 0-32 14-32 32s14 32 32 32h384c18 0 32-14 32-32s-14-32-32-32h-96l-9-26c-4-13-16-22-30-22H177z" fill="var(--colors-danger-DEFAULT)"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
</template>

<script lang="ts" setup>
defineProps<{ filled?: boolean }>();
</script>
