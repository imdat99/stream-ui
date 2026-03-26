<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>

<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 628 628"><path d="M286 343 618 10 394 618 286 343z" fill="var(--fill1)"/><path d="M618 10 10 234l276 109L618 10z" fill="var(--fill4)"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
</template>
