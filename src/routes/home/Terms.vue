<template>
    <div class="max-w-4xl mx-auto space-y-10" style="opacity: 1; transform: none;">
        <div class="grow pt-32 pb-12 px-4">
            <div class="max-w-4xl mx-auto space-y-10">
                <div class="space-y-3">
                    <p
                        class="inline-block px-4 py-1.5 rounded-full bg-info/20 font-bold text-sm uppercase">
                        {{ pageContent.data.pageSubheading }}</p>
                    <h1 class="text-4xl md:text-5xl font-heading font-extrabold">{{ pageContent.data.pageHeading }}</h1>
                    <p class="text-slate-600 text-lg font-medium">{{ pageContent.data.description }}</p>
                </div>
                    <div class="bg-white p-8 rounded-xl border border-gray-200 shadow-hard space-y-6">
                    <section v-for="(item, index) in pageContent.data.list" :key="index">
                        <h2 class="text-2xl font-bold mb-4">{{ item.heading }}</h2>
                        <p class="leading-relaxed">{{ item.text }}</p>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';

const { t } = useI18n();

const pageContent = computed(() => {
    const title = t('legal.terms.title');
    const description = t('legal.terms.description');

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
            pageHeading: t('legal.terms.pageHeading'),
            pageSubheading: t('legal.terms.pageSubheading'),
            description: t('legal.terms.pageDescription'),
            list: [
                {
                    heading: t('legal.terms.sections.acceptanceTitle'),
                    text: t('legal.terms.sections.acceptanceText')
                },
                {
                    heading: t('legal.terms.sections.usageTitle'),
                    text: t('legal.terms.sections.usageText')
                },
                {
                    heading: t('legal.terms.sections.ownershipTitle'),
                    text: t('legal.terms.sections.ownershipText')
                },
                {
                    heading: t('legal.terms.sections.liabilityTitle'),
                    text: t('legal.terms.sections.liabilityText')
                },
                {
                    heading: t('legal.terms.sections.changesTitle'),
                    text: t('legal.terms.sections.changesText')
                }
            ]
        }
    };
});

useHead(() => pageContent.value.head);
</script>
