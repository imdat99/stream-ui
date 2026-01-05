<template>
    <svg xmlns="http://www.w3.org/2000/svg" v-if="filled" width="24" viewBox="0 0 532 404">
        <path d="M10 74v256c0 35 29 64 64 64h256c35 0 64-29 64-64V74c0-35-29-64-64-64H74c-35 0-64 29-64 64z"
            fill="#a6acb9" />
        <path d="M394 135v134l90 72c4 3 9 5 14 5 13 0 24-11 24-24V82c0-13-11-24-24-24-5 0-10 2-14 5l-90 72z"
            fill="#1e3050" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" v-else width="24" viewBox="22 -194 564 404">
        <path
            d="M96-136c-9 0-16 7-16 16v256c0 9 7 16 16 16h256c9 0 16-7 16-16v-256c0-9-7-16-16-16H96zm-64 16c0-35 29-64 64-64h256c35 0 64 29 64 64v256c0 35-29 64-64 64H96c-35 0-64-29-64-64v-256zm506-11c4-3 9-5 14-5 13 0 24 11 24 24v240c0 13-11 24-24 24-5 0-10-2-14-5l-74-55V32l64 48V-64l-64 48v-60l74-55z"
            fill="#1e3050" />
    </svg>
</template>
<script lang="ts" setup>
defineProps<{ class?: string, filled?: boolean }>();
</script>