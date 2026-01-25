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
const title = "Terms and Conditions - Ecostream";
const description = "Read Ecostream's terms and conditions for using our video hosting and streaming services.";
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
        pageHeading: "Terms and Conditions Details",
        pageSubheading: "Terms and Conditions",
        description: "Our terms and conditions set forth important guidelines and rules for using Ecostream's services.",
        list: [
            {
                heading: "1. Acceptance of Terms",
                text: "By accessing and using Ecostream, you accept and agree to be bound by the terms and provision of this agreement."
            },
            {
                heading: "2. Service Usage",
                text: "You agree to use our service only for lawful purposes. You are prohibited from posting or transmitting any unlawful, threatening, libelous, defamatory, obscene, or profane material. We reserve the right to terminate accounts that violate these terms."
            },
            {
                heading: "3. Content Ownership",
                text: "You retain all rights and ownership of the content you upload to Ecostream. However, by uploading content, you grant us a license to host, store, and display the content as necessary to provide our services."
            },
            {
                heading: "4. Limitation of Liability",
                text: "Ecostream shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service."
            },
            {
                heading: "5. Changes to Terms",
                text: "We reserve the right to modify these terms at any time. Your continued use of the service after any such changes constitutes your acceptance of the new terms."
            }
        ]
    }
}
useHead(pageContent.head);
</script>