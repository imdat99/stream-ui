<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore()

</script>

<template>
    <div class="bg-gradient-to-r to-success/20 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-success/30 mb-8">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2">Welcome back, {{
            auth.user?.username }}! 👋
        </h1>
        <p class="text-sm sm:text-base text-gray-600 font-medium">Here's what's happening with your content
            today.</p>
    </div>
</template>
