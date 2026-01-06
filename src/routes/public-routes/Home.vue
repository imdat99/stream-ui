<template>
    <section class=":m: relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-svh flex">
        <!-- <div class="absolute inset-0 bg-grid-pattern opacity-[0.4] -z-10"></div> -->
        <div
            class=":m: absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary-light/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse duration-1000">
        </div>
        <div
            class=":m: absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply">
        </div>


        <div class="max-w-7xl m-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
                class="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] animate-backwards">
                Video infrastructure for <br>
                <span class="text-gradient">modern internet.</span>
            </h1>

            <p class="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-backwards delay-50">
                Seamlessly host, encode, and stream video with our developer-first API.
                Optimized for speed, built for scale.
            </p>

            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <RouterLink to="/get-started" class="flex btn btn-success !rounded-xl !p-4 press-animated">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="46 -286 524 580">
                        <path d="M56 284v-560L560 4 56 284z" fill="#fff" />
                    </svg>&nbsp;
                    Get Started
                </RouterLink>
                <RouterLink to="/docs" class="flex btn btn-outline-primary !rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" viewBox="0 0 596 468">
                        <path
                            d="M10 314c0-63 41-117 98-136-1-8-2-16-2-24 0-79 65-144 144-144 55 0 104 31 128 77 14-8 30-13 48-13 53 0 96 43 96 96 0 16-4 31-10 44 44 20 74 64 74 116 0 71-57 128-128 128H154c-79 0-144-64-144-144zm199-73c-9 9-9 25 0 34s25 9 34 0l31-31v102c0 13 11 24 24 24s24-11 24-24V244l31 31c9 9 25 9 34 0s9-25 0-34l-72-72c-10-9-25-9-34 0l-72 72z"
                            fill="#14a74b" />
                        <path
                            d="M281 169c9-9 25-9 34 0l72 72c9 9 9 25 0 34s-25 9-34 0l-31-31v102c0 13-11 24-24 24s-24-11-24-24V244l-31 31c-9 9-25 9-34 0s-9-25 0-34l72-72z"
                            fill="#fff" />
                    </svg>&nbsp;
                    Upload video
                </RouterLink>
            </div>
        </div>
    </section>
    <section id="features" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-16 md:text-center max-w-3xl mx-auto">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">Everything you need to ship video</h2>
                <p class="text-lg text-slate-500">Focus on building your product. We'll handle the complex video
                    infrastructure.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    class=":m: md:col-span-2 bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-primary/60 transition-all group overflow-hidden relative">
                    <div class="relative z-10">
                        <div
                            class="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="532" viewBox="-8 -258 529 532">
                                <path
                                    d="M342 32c-2 69-16 129-35 172-10 23-22 40-32 49-10 10-16 11-19 11h-1c-3 0-9-1-19-11-10-9-22-26-32-49-19-43-33-103-35-172h173zm169 0c-9 103-80 188-174 219 30-51 50-129 53-219h121zm-390 0c3 89 23 167 53 218C80 219 11 134 2 32h119zm53-266c-30 51-50 129-53 218H2c9-102 78-186 172-218zm82-14c3 0 9 1 19 11 10 9 22 26 32 50 19 42 33 102 35 171H169c3-69 16-129 35-171 10-24 22-41 32-50s16-11 19-11h1zm81 13c94 31 165 116 174 219H390c-3-90-23-168-53-219z"
                                    fill="#059669" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 mb-2">Global Edge Network</h3>
                        <p class="text-slate-500 max-w-md">Content delivered from 200+ PoPs worldwide. Automatic region
                            selection ensures the lowest latency for every viewer.</p>
                    </div>
                    <div class="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="-10 -258 532 532">
                            <path
                                d="M464 8c0-19-3-38-8-56l-27-5c-8-2-15 2-19 9-6 11-19 17-31 13l-14-5c-8-2-17 0-22 5-4 4-4 10 0 14l33 33c5 5 8 12 8 19 0 12-8 23-20 26l-6 1c-3 1-6 5-6 9v12c0 13-4 27-13 38l-25 34c-6 8-16 13-26 13-18 0-32-14-32-32V88c0-9-7-16-16-16h-32c-26 0-48-22-48-48V-4c0-13 6-24 16-32l39-30c6-4 13-6 20-6 3 0 7 1 10 2l32 10c7 3 15 3 22 1l36-9c10-2 17-11 17-22 0-8-5-16-13-20l-29-15c-3-2-8-1-11 2l-4 4c-4 4-11 7-17 7-4 0-8-1-11-3l-15-7c-7-4-15-2-20 4l-13 17c-6 7-16 8-22 1-3-2-5-6-5-10v-41c0-6-1-11-4-16l-10-18C102-154 48-79 48 8c0 115 93 208 208 208S464 123 464 8zM0 8c0-141 115-256 256-256S512-133 512 8 397 264 256 264 0 149 0 8z"
                                fill="#1e3050" />
                        </svg>
                    </div>
                </div>

                <div class=":m: md:row-span-2 bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group">
                    <div class=":m: absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent"></div>
                    <div class="relative z-10">
                        <div
                            class=":m: w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="-10 -146 468 384">
                                <path
                                    d="M392-136c-31 0-56 25-56 56v280c0 16 13 28 28 28h28c31 0 56-25 56-56V-80c0-31-25-56-56-56zM168 4c0-31 25-56 56-56h28c16 0 28 13 28 28v224c0 16-12 28-28 28h-56c-15 0-28-12-28-28V4zM0 88c0-31 25-56 56-56h28c16 0 28 13 28 28v140c0 16-12 28-28 28H56c-31 0-56-25-56-56V88z"
                                    fill="#fff" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Live Streaming API</h3>
                        <p class="text-slate-400 text-sm leading-relaxed mb-8">Scale to millions of concurrent viewers
                            with ultra-low latency. RTMP ingest and HLS playback supported natively.</p>

                        <!-- Visual -->
                        <div
                            class="bg-slate-800/50 rounded-lg p-4 border border-white/5 font-mono text-xs text-brand-300">
                            <div class="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                                <span class="text-slate-500">Live Status</span>
                                <span
                                    class=":m: flex items-center gap-1.5 text-red-500 text-[10px] uppercase font-bold tracking-wider animate-pulse"><span
                                        class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> On Air</span>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between"><span class="text-slate-400">Bitrate:</span> <span
                                        class="text-white">6000 kbps</span></div>
                                <div class="flex justify-between"><span class="text-slate-400">FPS:</span> <span
                                        class="text-white">60</span></div>
                                <div class="flex justify-between"><span class="text-slate-400">Latency:</span> <span
                                        class="text-brand-400">~2s</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Standard Feature -->
                <div
                    class=":m: bg-slate-50 rounded-2xl p-8 border border-slate-100 transition-all group hover:(border-brand-200 shadow-lg shadow-brand-500/5)">
                    <div
                        class=":m: w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-purple-600 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 570 570">
                            <path
                                d="M50 428c-5 5-5 14 0 19s14 5 19 0l237-237c5-5 5-14 0-19s-14-5-19 0L50 428zm16-224c-5 5-5 13 0 19 5 5 14 5 19 0l12-12c5-5 5-14 0-19-6-5-14-5-20 0l-11 12zM174 60c-5 5-5 13 0 19 5 5 14 5 19 0l12-12c5-5 5-14 0-19-6-5-14-5-20 0l-11 12zm215 29c-5 5-5 14 0 19s14 5 19 0l39-39c5-5 5-14 0-19s-14-5-19 0l-39 39zm21 357c-5 5-5 14 0 19s14 5 19 0l18-18c5-5 5-14 0-19s-14-5-19 0l-18 18z"
                                fill="#a6acb9" />
                            <path
                                d="M170 26c14-15 36-15 50 0l18 18c15 14 15 36 0 50l-18 18c-14 15-36 15-50 0l-18-18c-15-14-15-36 0-50l18-18zm35 41c5-5 5-14 0-19-6-5-14-5-20 0l-11 12c-5 5-5 13 0 19 5 5 14 5 19 0l12-12zm204 342c21-21 55-21 76 0l18 18c21 21 21 55 0 76l-18 18c-21 21-55 21-76 0l-18-18c-21-21-21-55 0-76l18-18zm38 38c5-5 5-14 0-19s-14-5-19 0l-18 18c-5 5-5 14 0 19s14 5 19 0l18-18zM113 170c-15-15-37-15-51 0l-18 18c-14 14-14 36 0 50l18 18c14 15 37 15 51 0l18-18c14-14 14-36 0-50l-18-18zm-16 41-12 12c-5 5-14 5-19 0-5-6-5-14 0-20l11-11c6-5 14-5 20 0 5 5 5 14 0 19zM485 31c-21-21-55-21-76 0l-39 39c-21 21-21 55 0 76l54 54c21 21 55 21 76 0l39-39c21-21 21-55 0-76l-54-54zm-38 38-39 39c-5 5-14 5-19 0s-5-14 0-19l39-39c5-5 14-5 19 0s5 14 0 19zm-49 233c21-21 21-55 0-76l-54-54c-21-21-55-21-76 0L31 409c-21 21-21 55 0 76l54 54c21 21 55 21 76 0l237-237zm-92-92L69 447c-5 5-14 5-19 0s-5-14 0-19l237-237c5-5 14-5 19 0s5 14 0 19z"
                                fill="#1e3050" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Instant Encoding</h3>
                    <p class="text-slate-500 text-sm">Upload raw files and get optimized HLS/DASH streams in seconds.
                    </p>
                </div>

                <!-- Standard Feature -->
                <div
                    class=":m: bg-slate-50 rounded-2xl p-8 border border-slate-100 transition-all group hover:(border-brand-200 shadow-lg shadow-brand-500/5)">
                    <div
                        class=":m: w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-orange-600 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="-10 -226 532 468">
                            <path
                                d="M32-216c18 0 32 14 32 32v336c0 9 7 16 16 16h400c18 0 32 14 32 32s-14 32-32 32H80c-44 0-80-36-80-80v-336c0-18 14-32 32-32zM144-24c18 0 32 14 32 32v64c0 18-14 32-32 32s-32-14-32-32V8c0-18 14-32 32-32zm144-64V72c0 18-14 32-32 32s-32-14-32-32V-88c0-18 14-32 32-32s32 14 32 32zm80 32c18 0 32 14 32 32v96c0 18-14 32-32 32s-32-14-32-32v-96c0-18 14-32 32-32zm144-96V72c0 18-14 32-32 32s-32-14-32-32v-224c0-18 14-32 32-32s32 14 32 32z"
                                fill="#1e3050" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Deep Analytics</h3>
                    <p class="text-slate-500 text-sm">Session-level insights, quality of experience (QoE) metrics, and
                        more.</p>
                </div>
            </div>
        </div>
    </section>
    <!-- Pricing -->
    <section id="pricing" class="py-24 border-t border-slate-100 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">{{ pricing.title }}</h2>
                <p class="text-slate-500">{{ pricing.subtitle }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div v-for="pack in pricing.packs" :key="pack.name"
                    :class="cn(':uno: p-8 rounded-2xl relative overflow-hidden hover:border-primary transition-colors flex flex-col justify-between', pack.tag == 'POPULAR' ? 'border-primary/80 border-2' : 'border-slate-200 border')"
                    :style="{ background: pack.bg }">
                    <div v-if="pack.tag"
                        class=":m: absolute top-0 right-0 bg-primary/80 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                        {{ pack.tag }}</div>
                    <div>
                        <h3 class="font-semibold text-slate-900 text-xl mb-2">{{ pack.name }}</h3>
                        <div class="flex items-baseline gap-1 mb-6">
                            <span class="text-4xl font-bold text-slate-900">{{ pack.price }}</span>
                            <span class="text-slate-500">/mo</span>
                        </div>
                    </div>
                    <ul class="space-y-3 mb-8 text-sm text-slate-600">
                        <li v-for="value in pack.features" :key="value" class="flex items-center gap-3"><Check-Icon
                                class="fas fa-check text-brand-500" /> {{ value }}</li>
                    </ul>
                    <router-link to="/sign-up"
                        :class="cn('btn flex justify-center w-full !py-2.5', pack.tag == 'POPULAR' ? 'btn-primary' : 'btn-outline-primary')">{{
                        pack.buttonText }}</router-link>
                </div>
            </div>
        </div>
    </section>
</template>
<script lang="ts" setup>
import { Head } from '@unhead/vue/components'
import { cn } from '@/lib/utils';
const pricing = {
    title: "Simple, transparent pricing",
    subtitle: "Choose the plan that fits your needs. No hidden fees.",
    packs: [
        {
            name: "Hobby",
            price: "$0",
            features: [
                "Unlimited upload",
                "1 Hour of Storage",
                "Standard Support",
            ],
            buttonText: "Start Free",
            tag: "",
            bg: "#f9fafb",
        },
        {
            name: "Pro",
            price: "$29",
            features: [
                "Ads free player",
                "Support M3U8",
                "Unlimited upload",
                "Custom ads"
            ],
            buttonText: "Get Started",
            tag: "POPULAR",
            bg: "#eff6ff",
        },
        {
            name: "Scale",
            price: "$99",
            features: [
                "5 TB Bandwidth",
                "500 Hours Storage",
                "Priority Support"
            ],
            buttonText: "Contact Sales",
            tag: "Best Value",
            bg: "#eef4f7",
        }
    ]
}
</script>
