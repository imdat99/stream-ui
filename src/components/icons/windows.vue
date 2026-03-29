<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 468"><path d="M170 74v64h64V74h288v192h-96v64h96c35 0 64-29 64-64V74c0-35-29-64-64-64H234c-35 0-64 29-64 64z" fill="var(--fill1)"/><path d="M74 138c-35 0-64 29-64 64v192c0 35 29 64 64 64h288c35 0 64-29 64-64V202c0-35-29-64-64-64H74zm24 80h240c13 0 24 11 24 24s-11 24-24 24H98c-13 0-24-11-24-24s11-24 24-24z" fill="var(--fill4)"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="596" height="468" viewBox="-10 -226 596 468"><path d="M512-184H224c-18 0-32 14-32 32v16h-32v-16c0-35 29-64 64-64h288c35 0 64 29 64 64V40c0 35-29 64-64 64h-48V72h48c18 0 32-14 32-32v-192c0-18-14-32-32-32zM352-56H64c-18 0-32 14-32 32V8h352v-32c0-18-14-32-32-32zm32 96H32v128c0 18 14 32 32 32h288c18 0 32-14 32-32V40zM64-88h288c35 0 64 29 64 64v192c0 35-29 64-64 64H64c-35 0-64-29-64-64V-24c0-35 29-64 64-64z" fill="currentColor"/></svg>
</template>
<script lang="ts" setup>
defineProps<{  filled?: boolean }>();
</script>
