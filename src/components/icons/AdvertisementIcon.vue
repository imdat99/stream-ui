<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 518"><path d="M234 124v256c58 3 113 25 156 63l47 41c9 8 23 10 34 5 12-5 19-16 19-29V44c0-13-7-24-19-29-11-5-25-3-34 5l-47 41c-43 38-98 60-156 63z" fill="color-mix(in srgb, var(--colors-primary-DEFAULT) 40%, transparent)"/><path d="M138 124c-71 0-128 57-128 128s57 128 128 128v96c0 18 14 32 32 32h32c18 0 32-14 32-32V124h-96z" fill="currentColor"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="-10 -242 500 516"><path d="M448-194v404l-26-24c-50-47-114-75-182-81V-89c68-6 132-34 182-81l26-24zM240 137c60 6 116 31 160 72l34 32c5 4 12 7 19 7 15 0 27-12 27-27v-425c0-16-12-28-27-28-7 0-14 3-19 8l-34 31c-50 47-116 73-185 73h-87C57-120 0-63 0 8c0 60 41 110 96 124v84c0 27 22 48 48 48h48c27 0 48-21 48-48v-79zm-40-1h8v80c0 9-7 16-16 16h-48c-9 0-16-7-16-16v-80h72zm0-224h8v192h-80c-53 0-96-43-96-96s43-96 96-96h72z" fill="currentColor"/></svg>
</template>
<script lang="ts" setup>
defineProps<{
    filled?: boolean;
}>();
</script>