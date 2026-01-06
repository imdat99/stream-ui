<template>
    <vue-head :input="{title: '404 - Page Not Found'}"/>
    <div class=":m: mx-auto text-center mt-20 flex flex-col items-center gap-4">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <router-link class="btn btn-primary" to="/">Go back to Home</router-link>
    </div>
</template>

<script setup lang="ts">
import { VueHead } from "@/components/VueHead";
</script>