<template>
    <svg xmlns="http://www.w3.org/2000/svg" v-if="filled" width="24" viewBox="0 0 532 404"><path d="M10 74c0-35 29-64 64-64h384c35 0 64 29 64 64v32H10V74zm0 96h512v160c0 35-29 64-64 64H74c-35 0-64-29-64-64V170zm64 136c0 13 11 24 24 24h48c13 0 24-11 24-24s-11-24-24-24H98c-13 0-24 11-24 24zm144 0c0 13 11 24 24 24h64c13 0 24-11 24-24s-11-24-24-24h-64c-13 0-24 11-24 24z" fill="#a6acb9"/><path d="M10 106h512v64H10zm0 0z" fill="#1e3050"/></svg>
    <svg xmlns="http://www.w3.org/2000/svg" v-else width="24" viewBox="-10 -194 532 404"><path d="M448-136c9 0 16 7 16 16v32H48v-32c0-9 7-16 16-16h384zm16 112v160c0 9-7 16-16 16H64c-9 0-16-7-16-16V-24h416zM64-184c-35 0-64 29-64 64v256c0 35 29 64 64 64h384c35 0 64-29 64-64v-256c0-35-29-64-64-64H64zM80 96c0 13 11 24 24 24h48c13 0 24-11 24-24s-11-24-24-24h-48c-13 0-24 11-24 24zm144 0c0 13 11 24 24 24h64c13 0 24-11 24-24s-11-24-24-24h-64c-13 0-24 11-24 24z" fill="#1e3050"/></svg>
</template>
<script lang="ts" setup>
defineProps<{ class?: string, filled?: boolean }>();
</script>