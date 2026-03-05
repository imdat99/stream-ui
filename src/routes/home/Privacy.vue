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
