<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" x2="20" y1="21" y2="21" />
        <polygon points="12 11 4 18 4 6 12 11" />
        <path d="M16 8.73a2 2 0 0 1 0 3.55" />
        <path d="M18 5.05a6 6 0 0 1 0 10.9" />
    </svg>
</template>
