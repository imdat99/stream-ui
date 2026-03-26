<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>

<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 532 404"><path d="M10 58c0 15 7 29 19 38l208 156c17 13 41 13 58 0L503 96c12-9 19-23 19-38v272c0 35-29 64-64 64H74c-35 0-64-29-64-64V58z" fill="var(--fill1)"/><path d="M58 10c-26 0-48 22-48 48 0 15 7 29 19 38l208 156c17 13 41 13 58 0L503 96c12-9 19-23 19-38 0-26-21-48-48-48H58z" fill="var(--fill4)"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
</template>
