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
import {useHead} from "@unhead/vue";
const title = "Privacy Policy - Ecostream";
const description = "Read about Ecostream's commitment to protecting your privacy and data security.";
const pageContent = {
    head: {
        title,
        meta: [
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "twitter:title", content: title },
            { property: "twitter:description", content: description },
            { property: "twitter:image", content: "https://Ecostream.com/thumb.png" }
        ]
    },
    data: {
        pageHeading: "Legal & Privacy Policy",
        pageSubheading: "Legal & Privacy Policy",
        description: "Our legal and privacy policy.",
        list: [{
            heading: "1. Privacy Policy",
            text: "At Ecostream, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information. We only collect information that is necessary for the operation of our service, including email addresses for account creation and payment information for subscription processing."
        },
        {
            heading: "2. Data Collection",
            text: "We collect data such as IP addresses, browser types, and access times to analyze trends and improve our service. Uploaded content is stored securely and is only accessed as required for the delivery of our hosting services."
        },
        {
            heading: "3. Cookie Policy",
            text: "We use cookies to maintain user sessions and preferences. By using our website, you consent to the use of cookies in accordance with this policy."
        },
        {
            heading: "4. DMCA & Copyright",
            text: "Ecostream respects the intellectual property rights of others. We respond to notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA). Please report any copyright violations to our support team."
        }]
    }
}
useHead(pageContent.head);
</script>