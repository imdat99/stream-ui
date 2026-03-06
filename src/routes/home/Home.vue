<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const { t } = useTranslation();

const signalItems = computed(() => [
    { label: t('home.features.live.bitrate'), value: t('home.features.live.bitrateValue') },
    { label: t('home.features.live.fps'), value: t('home.features.live.fpsValue') },
    { label: t('home.features.live.latency'), value: t('home.features.live.latencyValue') },
]);

const featurePills = computed(() => [
    t('home.features.global.title'),
    t('home.features.encoding.title'),
    t('home.features.analytics.title'),
]);

const getFeatureList = (key: string): string[] => {
    const localized = t(key, { returnObjects: true });
    return Array.isArray(localized) ? localized.map((item) => String(item)) : [];
};

const pricing = computed(() => ({
    title: t('home.pricing.title'),
    subtitle: t('home.pricing.subtitle'),
    packs: [
        {
            name: t('home.pricing.hobby.name'),
            price: '$0',
            features: getFeatureList('home.pricing.hobby.features'),
            buttonText: t('home.pricing.hobby.button'),
            tag: '',
        },
        {
            name: t('home.pricing.pro.name'),
            price: '$29',
            features: getFeatureList('home.pricing.pro.features'),
            buttonText: t('home.pricing.pro.button'),
            tag: t('home.pricing.pro.tag'),
        },
        {
            name: t('home.pricing.scale.name'),
            price: '$99',
            features: getFeatureList('home.pricing.scale.features'),
            buttonText: t('home.pricing.scale.button'),
            tag: t('home.pricing.scale.tag'),
        }
    ]
}));

const featuredTag = computed(() => t('home.pricing.pro.tag'));
const scaleTag = computed(() => t('home.pricing.scale.tag'));
const isFeaturedPack = (tag: string) => tag === featuredTag.value;
const isScalePack = (tag: string) => tag === scaleTag.value;
</script>

<template>
    <div class="bg-white text-slate-900">
        <section class="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white">
            <div class="pointer-events-none absolute inset-0">
                <div class="absolute inset-0 opacity-60 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[length:64px_64px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.55),transparent_78%)]"></div>
                <div class="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(20,167,75,0.12),transparent_58%)]"></div>
                <div class="absolute -left-16 top-28 h-56 w-56 rounded-full bg-primary/10 blur-3xl"></div>
                <div class="absolute right-0 top-20 h-72 w-72 rounded-full bg-sky-100 blur-3xl"></div>
            </div>

            <div class="relative mx-auto max-w-7xl px-4 pb-18 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-34">
                <div class="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
                    <div>
                        <div class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
                            <span class="h-2 w-2 rounded-full bg-primary"></span>
                            {{ t('home.features.live.onAir') }}
                        </div>

                        <h1 class="mt-7 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                            <span class="block">{{ t('home.hero.titleLine1') }}</span>
                            <span class="mt-2 block bg-[linear-gradient(135deg,#0f172a_0%,#14a74b_55%,#0ea5e9_100%)] bg-clip-text text-transparent">
                                {{ t('home.hero.titleLine2') }}
                            </span>
                        </h1>

                        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 lg:text-xl">
                            {{ t('home.hero.subtitle') }}
                        </p>

                        <div class="mt-9 flex flex-col gap-3 sm:flex-row">
                            <RouterLink to="/sign-up" class="btn btn-success !rounded-xl !px-6 !py-3.5 shadow-sm">
                                {{ t('home.hero.getStarted') }}
                            </RouterLink>
                            <RouterLink to="/login" class="btn btn-outline-primary !rounded-xl !px-6 !py-3.5">
                                {{ t('home.hero.uploadVideo') }}
                            </RouterLink>
                        </div>

                        <div class="mt-10 grid gap-4 sm:grid-cols-3">
                            <div
                                v-for="signal in signalItems"
                                :key="signal.label"
                                class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                            >
                                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    {{ signal.label }}
                                </p>
                                <p class="mt-2 text-xl font-bold text-slate-900">
                                    {{ signal.value }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="relative mx-auto w-full max-w-[36rem] lg:mr-0">
                        <div class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
                            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {{ t('home.features.live.status') }}
                                    </p>
                                    <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                                        {{ t('home.features.live.title') }}
                                    </h2>
                                </div>
                                <span class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    <span class="h-2 w-2 rounded-full bg-primary"></span>
                                    {{ t('home.features.live.onAir') }}
                                </span>
                            </div>

                            <p class="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                                {{ t('home.features.live.description') }}
                            </p>

                            <div class="mt-5 rounded-[1.5rem] bg-slate-50 p-4 sm:p-5">
                                <div class="space-y-3">
                                    <div
                                        v-for="signal in signalItems"
                                        :key="signal.label"
                                        class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                    >
                                        <span class="text-sm text-slate-500">{{ signal.label }}</span>
                                        <span class="text-sm font-semibold text-slate-900">{{ signal.value }}</span>
                                    </div>
                                </div>

                                <div class="mt-5 grid grid-cols-12 items-end gap-2">
                                    <span
                                        v-for="n in 12"
                                        :key="n"
                                        class="rounded-full bg-[linear-gradient(180deg,rgba(20,167,75,0.95),rgba(20,167,75,0.2))]"
                                        :style="{ height: `${34 + (n % 5) * 12}px`, opacity: 0.4 + (n % 4) * 0.13 }"
                                    />
                                </div>
                            </div>

                            <div class="mt-5 flex flex-wrap gap-2.5">
                                <span
                                    v-for="pill in featurePills"
                                    :key="pill"
                                    class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                                >
                                    {{ pill }}
                                </span>
                            </div>
                        </div>

                        <div class="absolute -right-4 top-12 hidden w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:block">
                            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {{ t('home.features.global.title') }}
                            </p>
                            <p class="mt-3 text-sm leading-6 text-slate-600">
                                {{ t('home.features.global.description') }}
                            </p>
                        </div>

                        <div class="absolute -left-4 bottom-8 hidden w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:block">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-slate-900">
                                    {{ t('home.features.analytics.title') }}
                                </p>
                                <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                                    {{ t('home.features.live.onAir') }}
                                </span>
                            </div>
                            <p class="mt-2 text-sm leading-6 text-slate-600">
                                {{ t('home.features.analytics.description') }}
                            </p>
                            <div class="mt-4 grid grid-cols-4 items-end gap-2">
                                <span class="h-10 rounded-full bg-slate-200"></span>
                                <span class="h-18 rounded-full bg-primary/70"></span>
                                <span class="h-14 rounded-full bg-sky-300"></span>
                                <span class="h-22 rounded-full bg-slate-900"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" class="border-b border-slate-100 bg-slate-50/70 py-20">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="mx-auto mb-14 max-w-3xl text-center">
                    <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        {{ t('home.features.heading') }}
                    </p>
                    <h2 class="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {{ t('home.features.heading') }}
                    </h2>
                    <p class="mt-4 text-lg leading-8 text-slate-600">
                        {{ t('home.features.subtitle') }}
                    </p>
                </div>

                <div class="grid gap-6 lg:grid-cols-3">
                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="-8 -258 529 532" fill="none">
                                <path
                                    d="M342 32c-2 69-16 129-35 172-10 23-22 40-32 49-10 10-16 11-19 11h-1c-3 0-9-1-19-11-10-9-22-26-32-49-19-43-33-103-35-172h173zm169 0c-9 103-80 188-174 219 30-51 50-129 53-219h121zm-390 0c3 89 23 167 53 218C80 219 11 134 2 32h119zm53-266c-30 51-50 129-53 218H2c9-102 78-186 172-218zm82-14c3 0 9 1 19 11 10 9 22 26 32 50 19 42 33 102 35 171H169c3-69 16-129 35-171 10-24 22-41 32-50s16-11 19-11h1zm81 13c94 31 165 116 174 219H390c-3-90-23-168-53-219z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <h3 class="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                            {{ t('home.features.global.title') }}
                        </h3>
                        <p class="mt-3 text-base leading-7 text-slate-600">
                            {{ t('home.features.global.description') }}
                        </p>
                    </article>

                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 570 570" fill="none">
                                <path
                                    d="M50 428c-5 5-5 14 0 19s14 5 19 0l237-237c5-5 5-14 0-19s-14-5-19 0L50 428zm16-224c-5 5-5 13 0 19 5 5 14 5 19 0l12-12c5-5 5-14 0-19-6-5-14-5-20 0l-11 12zM174 60c-5 5-5 13 0 19 5 5 14 5 19 0l12-12c5-5 5-14 0-19-6-5-14-5-20 0l-11 12zm215 29c-5 5-5 14 0 19s14 5 19 0l39-39c5-5 5-14 0-19s-14-5-19 0l-39 39zm21 357c-5 5-5 14 0 19s14 5 19 0l18-18c5-5 5-14 0-19s-14-5-19 0l-18 18z"
                                    fill="#a6acb9"
                                />
                                <path
                                    d="M170 26c14-15 36-15 50 0l18 18c15 14 15 36 0 50l-18 18c-14 15-36 15-50 0l-18-18c-15-14-15-36 0-50l18-18zm35 41c5-5 5-14 0-19-6-5-14-5-20 0l-11 12c-5 5-5 13 0 19 5 5 14 5 19 0l12-12zm204 342c21-21 55-21 76 0l18 18c21 21 21 55 0 76l-18 18c-21 21-55 21-76 0l-18-18c-21-21-21-55 0-76l18-18zm38 38c5-5 5-14 0-19s-14-5-19 0l-18 18c-5 5-5 14 0 19s14 5 19 0l18-18zM113 170c-15-15-37-15-51 0l-18 18c-14 14-14 36 0 50l18 18c14 15 37 15 51 0l18-18c14-14 14-36 0-50l-18-18zm-16 41-12 12c-5 5-14 5-19 0-5-6-5-14 0-20l11-11c6-5 14-5 20 0 5 5 5 14 0 19zM485 31c-21-21-55-21-76 0l-39 39c-21 21-21 55 0 76l54 54c21 21 55 21 76 0l39-39c21-21 21-55 0-76l-54-54zm-38 38-39 39c-5 5-14 5-19 0s-5-14 0-19l39-39c5-5 14-5 19 0s5 14 0 19zm-49 233c21-21 21-55 0-76l-54-54c-21-21-55-21-76 0L31 409c-21 21-21 55 0 76l54 54c21 21 55 21 76 0l237-237zm-92-92L69 447c-5 5-14 5-19 0s-5-14 0-19l237-237c5-5 14-5 19 0s5 14 0 19z"
                                    fill="#1e3050"
                                />
                            </svg>
                        </div>
                        <h3 class="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                            {{ t('home.features.encoding.title') }}
                        </h3>
                        <p class="mt-3 text-base leading-7 text-slate-600">
                            {{ t('home.features.encoding.description') }}
                        </p>
                    </article>

                    <article class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
                        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="-10 -226 532 468" fill="none">
                                <path
                                    d="M32-216c18 0 32 14 32 32v336c0 9 7 16 16 16h400c18 0 32 14 32 32s-14 32-32 32H80c-44 0-80-36-80-80v-336c0-18 14-32 32-32zM144-24c18 0 32 14 32 32v64c0 18-14 32-32 32s-32-14-32-32V8c0-18 14-32 32-32zm144-64V72c0 18-14 32-32 32s-32-14-32-32V-88c0-18 14-32 32-32s32 14 32 32zm80 32c18 0 32 14 32 32v96c0 18-14 32-32 32s-32-14-32-32v-96c0-18 14-32 32-32zm144-96V72c0 18-14 32-32 32s-32-14-32-32v-224c0-18 14-32 32-32s32 14 32 32z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <h3 class="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                            {{ t('home.features.analytics.title') }}
                        </h3>
                        <p class="mt-3 text-base leading-7 text-slate-600">
                            {{ t('home.features.analytics.description') }}
                        </p>
                    </article>
                </div>

                <div class="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div class="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                                {{ t('home.features.live.title') }}
                            </p>
                            <h3 class="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                {{ t('home.features.live.title') }}
                            </h3>
                            <p class="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                {{ t('home.features.live.description') }}
                            </p>
                        </div>

                        <div class="rounded-[1.75rem] bg-slate-50 p-4">
                            <div class="space-y-3">
                                <div
                                    v-for="signal in signalItems"
                                    :key="`summary-${signal.label}`"
                                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                >
                                    <span class="text-sm text-slate-500">{{ signal.label }}</span>
                                    <span class="text-sm font-semibold text-slate-900">{{ signal.value }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="pricing" class="bg-white py-20">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="mx-auto mb-14 max-w-3xl text-center">
                    <p class="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        {{ pricing.title }}
                    </p>
                    <h2 class="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {{ pricing.title }}
                    </h2>
                    <p class="mt-4 text-lg leading-8 text-slate-600">
                        {{ pricing.subtitle }}
                    </p>
                </div>

                <div class="grid gap-6 lg:grid-cols-3 lg:items-stretch">
                    <article
                        v-for="pack in pricing.packs"
                        :key="pack.name"
                        :class="[
                            'relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]',
                            isFeaturedPack(pack.tag)
                                ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/15'
                                : isScalePack(pack.tag)
                                    ? 'border-slate-200 bg-slate-50/80'
                                    : 'border-slate-200 bg-white'
                        ]"
                    >
                        <div
                            v-if="pack.tag"
                            :class="[
                                'absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold',
                                isFeaturedPack(pack.tag) ? 'bg-primary text-white' : 'bg-slate-900 text-white'
                            ]"
                        >
                            {{ pack.tag }}
                        </div>

                        <div>
                            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {{ pack.name }}
                            </p>
                            <div class="mt-5 flex items-end gap-2">
                                <span class="text-5xl font-bold tracking-tight text-slate-900">{{ pack.price }}</span>
                                <span class="pb-2 text-slate-500">{{ t('home.pricing.perMonth') }}</span>
                            </div>
                        </div>

                        <ul class="mt-8 space-y-4">
                            <li v-for="value in pack.features" :key="value" class="flex items-start gap-3">
                                <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M5 12.5l4.2 4.2L19 7" />
                                    </svg>
                                </span>
                                <span class="text-slate-600">{{ value }}</span>
                            </li>
                        </ul>

                        <RouterLink
                            to="/sign-up"
                            :class="[
                                'mt-10 inline-flex w-full items-center justify-center !rounded-xl !py-3.5',
                                isFeaturedPack(pack.tag) ? 'btn btn-success' : 'btn btn-outline-primary'
                            ]"
                        >
                            {{ pack.buttonText }}
                        </RouterLink>
                    </article>
                </div>
            </div>
        </section>
    </div>
</template>
