<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 468"><path d="M10 74c0-35 29-64 64-64h320c35 0 64 29 64 64v256c0-35-29-64-64-64H74c-35 0-64 29-64 64V74zm288 288c0 18-14 32-32 32s-32-14-32-32 14-32 32-32 32 14 32 32z" fill="color-mix(in srgb, var(--colors-primary-DEFAULT) 40%, transparent)"/><path d="M10 330c0-35 29-64 64-64h320c35 0 64 29 64 64v64c0 35-29 64-64 64H74c-35 0-64-29-64-64v-64zm288 32c0-18-14-32-32-32s-32 14-32 32 14 32 32 32 32-14 32-32zm64 32c18 0 32-14 32-32s-14-32-32-32-32 14-32 32 14 32 32 32z" fill="var(--colors-primary-DEFAULT)"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="-10 -226 468 468"><path d="M64-184c-18 0-32 14-32 32V17c9-6 20-9 32-9h320c12 0 23 3 32 9v-169c0-18-14-32-32-32H64zM32 72v96c0 18 14 32 32 32h320c18 0 32-14 32-32V72c0-18-14-32-32-32H64c-18 0-32 14-32 32zM0 72v-224c0-35 29-64 64-64h320c35 0 64 29 64 64v320c0 35-29 64-64 64H64c-35 0-64-29-64-64V72zm256 24c13 0 24 11 24 24s-11 24-24 24-24-11-24-24 11-24 24-24zm96 0c13 0 24 11 24 24s-11 24-24 24-24-11-24-24 11-24 24-24z" fill="currentColor"/></svg>
</template>

<script lang="ts" setup>
defineProps<{ filled?: boolean }>();
</script>
