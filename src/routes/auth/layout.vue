<template>
    <div class="mx-a max-w-md w-full min-h-screen flex flex-col items-center px-4 justify-center">
        <div class="w-full h-6 mb-10"></div>
        <div
            class=":uno: w-full shadow-xl bg-white p-6 rounded-xl relative before:(content-[''] absolute inset-[-5px] translate-0 z-[-1] opacity-50 rounded-xl bg-[linear-gradient(135deg,var(--glow-stop-1)_0,var(--glow-stop-2)_25%,var(--glow-stop-3)_50%,var(--glow-stop-4)_75%,var(--glow-stop-5)_100%)] animate-[glow-enter-blur_1s_ease_.5s_both]) after:(content-[''] absolute inset-[-1px] translate-0 z-[-1] opacity-50 rounded-xl bg-[linear-gradient(135deg,transparent_0,transparent_34%,transparent_49%,#fff_57%,#fff_64%,var(--glow-stop-1)_66%,var(--glow-stop-2)_75%,var(--glow-stop-3)_83%,var(--glow-stop-4)_92%,var(--glow-stop-5)_100%)] bg-[length:300%_300%] bg-[position:0_0] bg-no-repeat transition-background-position duration-800 ease animate-[glow-enter-stroke_.5s_ease_.5s_both])">
            <div class="mb-6">
                <h2 class="text-xl font-medium text-gray-900">
                    {{ content[route.name as keyof typeof content]?.title || '' }}
                </h2>
                <vue-head :input="{
                    title: content[route.name as keyof typeof content]?.headTitle || 'Authentication',
                    meta: [
                        { name: 'description', content: content[route.name as keyof typeof content]?.subtitle || '' }
                    ]
                }" />
            </div>
            <router-view />
        </div>
        <router-link to="/" class="inline-flex items-center justify-center w-6 h-6 mt-10 group w-full">
            <img class="w-6 h-6" src="/apple-touch-icon.png" alt="Logo" />&ensp;<span
                class="text-[#6a6a6a] font-medium group-hover:text-gray-900">EcoStream</span>
        </router-link>
    </div>
</template>
<script setup lang="ts">
import vueHead from "@/components/VueHead";
import { useRoute } from 'vue-router';

const route = useRoute();
const content = {
    login: {
        headTitle: "Login to your account",
        title: 'Sign in to your dashboard',
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