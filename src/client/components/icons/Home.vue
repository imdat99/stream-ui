<template>
    <svg xmlns="http://www.w3.org/2000/svg" v-if="filled" class="v-mid m-a" height="24" width="24"
        viewBox="0 0 539 535">
        <path d="M61 281c2-1 4-3 6-5L269 89l202 187c2 2 4 4 6 5v180c0 35-29 64-64 64H125c-35 0-64-29-64-64V281z"
            fill="#a6acb9" />
        <path
            d="M247 22c13-12 32-12 44 0l224 208c13 12 13 32 1 45s-32 14-45 2L269 89 67 276c-13 12-33 12-45-1s-12-33 1-45L247 22z"
            fill="#1e3050" />
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" v-else class="v-mid m-a" height="24" width="24" viewBox="-11 -259 535 533">
        <path
            d="M272-242c-9-8-23-8-32 0L8-34C-2-25-3-10 6 0s24 11 34 2l8-7v205c0 35 29 64 64 64h288c35 0 64-29 64-64V-5l8 7c10 9 25 8 34-2s8-25-2-34L272-242zM416-48v248c0 9-7 16-16 16H112c-9 0-16-7-16-16V-48l160-144L416-48z"
            fill="#1e3050" />
    </svg>
</template>
<script lang="ts" setup>
defineProps<{ class?: string, filled?: boolean }>();
</script>