<template>
    <section class="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white">
        <div class="pointer-events-none absolute inset-0">
            <div class="absolute inset-0 opacity-55 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[length:64px_64px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.45),transparent_78%)]"></div>
            <div class="absolute left-0 top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl"></div>
            <div class="absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-100 blur-3xl"></div>
        </div>

        <div class="relative mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-34">
            <div class="mx-auto max-w-4xl">
                <div class="inline-flex items-center rounded-full border border-primary/15 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
                    {{ pageContent.data.pageSubheading }}
                </div>

                <div class="mt-6 max-w-3xl space-y-4">
                    <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                        {{ pageContent.data.pageHeading }}
                    </h1>
                    <p class="text-lg leading-8 text-slate-600">
                        {{ pageContent.data.description }}
                    </p>
                </div>

                <div class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
                    <div class="space-y-6">
                        <section
                            v-for="(item, index) in pageContent.data.list"
                            :key="index"
                            class="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)] sm:p-6"
                        >
                            <div class="flex items-start gap-4">
                                <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                                    {{ index + 1 }}
                                </div>
                                <div class="min-w-0">
                                    <h2 class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                        {{ item.heading }}
                                    </h2>
                                    <p class="mt-3 leading-8 text-slate-600">
                                        {{ item.text }}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';
import { useHead } from '@unhead/vue';

const { t } = useTranslation();

const pageContent = computed(() => {
    const title = t('legal.privacy.title');
    const description = t('legal.privacy.description');

    return {
        head: {
            title,
            meta: [
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'twitter:title', content: title },
                { property: 'twitter:description', content: description },
                { property: 'twitter:image', content: 'https://Ecostream.com/thumb.png' }
            ]
        },
        data: {
            pageHeading: t('legal.privacy.pageHeading'),
            pageSubheading: t('legal.privacy.pageSubheading'),
            description: t('legal.privacy.pageDescription'),
            list: [
                {
                    heading: t('legal.privacy.sections.policyTitle'),
                    text: t('legal.privacy.sections.policyText')
                },
                {
                    heading: t('legal.privacy.sections.dataCollectionTitle'),
                    text: t('legal.privacy.sections.dataCollectionText')
                },
                {
                    heading: t('legal.privacy.sections.cookieTitle'),
                    text: t('legal.privacy.sections.cookieText')
                },
                {
                    heading: t('legal.privacy.sections.dmcaTitle'),
                    text: t('legal.privacy.sections.dmcaText')
                }
            ]
        }
    };
});

useHead(() => pageContent.value.head);
</script>
