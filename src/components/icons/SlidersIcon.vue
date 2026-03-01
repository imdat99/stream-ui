<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <circle cx="8" cy="10" r="2" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M2 14h20" />
    </svg>
</template>
