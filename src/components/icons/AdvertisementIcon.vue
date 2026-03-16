<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 518"><path d="M234 124v256c58 3 113 25 156 63l47 41c9 8 23 10 34 5 12-5 19-16 19-29V44c0-13-7-24-19-29-11-5-25-3-34 5l-47 41c-43 38-98 60-156 63z" fill="#a6acb9"/><path d="M138 124c-71 0-128 57-128 128s57 128 128 128v96c0 18 14 32 32 32h32c18 0 32-14 32-32V124h-96z" fill="currentColor"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="500" height="518" viewBox="-10 -244 500 518"><path d="M461-229c12 5 19 16 19 29v416c0 13-7 24-19 29-11 5-25 3-34-5l-47-41c-43-38-98-60-156-63v96c0 18-14 32-32 32h-32c-18 0-32-14-32-32v-96C57 136 0 79 0 8s57-128 128-128h85c61 0 121-23 167-63l47-41c9-8 23-10 34-5zM224 72c70 3 138 29 192 74v-276c-54 45-122 71-192 74V72z" fill="currentColor"/></svg>
</template>
<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>