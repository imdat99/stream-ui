<template>
    <div class="mx-a max-w-md w-full min-h-screen flex flex-col items-center px-4 justify-center">
        <div class="w-full h-6 mb-10"></div>
        <div
            class=":uno: w-full shadow-xl bg-white p-6 rounded-xl relative before:(content-[''] absolute inset-[-5px] translate-0 z-[-1] opacity-50 rounded-xl bg-[linear-gradient(135deg,var(--glow-stop-1)_0,var(--glow-stop-2)_25%,var(--glow-stop-3)_50%,var(--glow-stop-4)_75%,var(--glow-stop-5)_100%)] animate-[glow-enter-blur_1s_ease_.5s_both]) after:(content-[''] absolute inset-[-1px] translate-0 z-[-1] opacity-50 rounded-xl bg-[linear-gradient(135deg,transparent_0,transparent_34%,transparent_49%,#fff_57%,#fff_64%,var(--glow-stop-1)_66%,var(--glow-stop-2)_75%,var(--glow-stop-3)_83%,var(--glow-stop-4)_92%,var(--glow-stop-5)_100%)] bg-[length:300%_300%] bg-[position:0_0] bg-no-repeat transition-background-position duration-800 ease animate-[glow-enter-stroke_.5s_ease_.5s_both])">
            <div class="mb-6">
                <h2 class="text-xl font-medium text-gray-900">
                    {{ content[route.name as keyof typeof content.value]?.title || '' }}
                </h2>
                <vue-head :input="{
                    title: content[route.name as keyof typeof content.value]?.headTitle || t('app.name'),
                    meta: [
                        { name: 'description', content: content[route.name as keyof typeof content.value]?.subtitle || '' }
                    ]
                }" />
            </div>
            <router-view />
        </div>
        <router-link to="/" class="inline-flex items-center justify-center w-6 h-6 mt-10 group w-full">
            <img class="w-6 h-6" src="/apple-touch-icon.png" alt="Logo" />&ensp;<span
                class="text-[#6a6a6a] font-medium group-hover:text-gray-900">{{ t('app.name') }}</span>
        </router-link>
    </div>
</template>
<script setup lang="ts">
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { t } = useTranslation();

const content = computed(() => ({
    login: {
        headTitle: t('auth.layout.login.headTitle'),
        title: t('auth.layout.login.title'),
        subtitle: t('auth.layout.login.subtitle')
    },
    signup: {
        headTitle: t('auth.layout.signup.headTitle'),
        title: t('auth.layout.signup.title'),
        subtitle: t('auth.layout.signup.subtitle')
    },
    forgot: {
        title: t('auth.layout.forgot.title'),
        subtitle: t('auth.layout.forgot.subtitle'),
        headTitle: t('auth.layout.forgot.headTitle')
    }
}));
</script>
