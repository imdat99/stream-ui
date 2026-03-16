<template>
    <svg v-if="filled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 596 404"><path d="M74 170v64c0 53 43 96 96 96h96v64h64v-64h96c53 0 96-43 96-96v-64c0-53-43-96-96-96h-96V10h-64v64h-96c-53 0-96 43-96 96zm96 0h256v64H170v-64z" fill="#a6acb9"/><path d="M170 10C82 10 10 82 10 170v64c0 88 72 160 160 160h96v-64h-96c-53 0-96-43-96-96v-64c0-53 43-96 96-96h96V10h-96zm256 384c88 0 160-72 160-160v-64c0-88-72-160-160-160h-96v64h96c53 0 96 43 96 96v64c0 53-43 96-96 96h-96v64h96zM202 170h-32v64h256v-64H202z" fill="currentColor"/></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="-10 -194 596 404"><path d="M160-184C72-184 0-112 0-24v64c0 88 72 160 160 160h96v-64h-96c-53 0-96-43-96-96v-64c0-53 43-96 96-96h96v-64h-96zm256 384c88 0 160-72 160-160v-64c0-88-72-160-160-160h-96v64h96c53 0 96 43 96 96v64c0 53-43 96-96 96h-96v64h96zM192-24h-32v64h256v-64H192z" fill="currentColor"/></svg>
</template>
<script lang="ts" setup>
defineProps<{ filled?: boolean }>();
</script>