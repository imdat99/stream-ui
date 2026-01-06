<template>
    <div class="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200 m-auto overflow-hidden">
        <div class="text-center mb-8">
            <router-link to="/" class="inline-flex items-center justify-center w-12 h-12 mb-4">
                <img class="w-12 h-12" src="/apple-touch-icon.png" alt="Logo" />
            </router-link>
            <h2 class="text-2xl font-bold text-gray-900">
                {{ content[route.name as keyof typeof content]?.title || '' }}
            </h2>
            <p class="text-gray-500 text-sm mt-1">
                {{ content[route.name as keyof typeof content]?.subtitle || '' }}
            </p>
            <vue-head :input="{
                title: content[route.name as keyof typeof content]?.headTitle || 'Authentication',
                meta: [
                    { name: 'description', content: content[route.name as keyof typeof content]?.subtitle || '' }
                ]
            }" />
        </div>
        <router-view />
    </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const content = {
    login: {
        headTitle: "Login to your account",
        title: 'Welcome back',
        subtitle: 'Please enter your details to sign in.'
    },
    signup: {
        headTitle: "Create your account",
        title: 'Create your account',
        subtitle: 'Please fill in the information to create your account.'
    },
    forgot: {
        title: 'Forgot your password?',
        subtitle: "Enter your email address and we'll send you a link to reset your password.",
        headTitle: "Reset your password"
    }
}
</script>