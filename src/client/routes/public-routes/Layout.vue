<template>
    <header>
        <nav class="fixed w-full z-50 glass-nav transition-all duration-300" id="navbar">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <router-link to="/" class="flex items-center gap-2 cursor-pointer">
                        <img class="h-8 w-8" src="/apple-touch-icon.png" alt="Logo" />
                        <span class="font-bold text-xl tracking-tight text-slate-900">EcoStream</span>
                    </router-link>
                    <div class="hidden md:flex items-center space-x-8">
                        <a href="#features"
                            class="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
                        <a href="#pricing"
                            class="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Pricing</a>
                    </div>
                    <div class="hidden md:flex items-center gap-4">
                        <RouterLink to="/login"
                            class="text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Log in
                        </RouterLink>
                        <RouterLink to="/sign-up"
                            class="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer">
                            Start for free
                        </RouterLink>
                    </div>
                </div>
            </div>
        </nav>
    </header>
    <main class="animate-fade-in delay-50 grow">
        <router-view />
    </main>
    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                <div class="col-span-2">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white">
                            <img class="h-6 w-6" src="/apple-touch-icon.png" alt="Logo" />
                        </div>
                        <span class="font-bold text-lg text-slate-900">EcoStream</span>
                    </div>
                    <p class="text-slate-500 text-sm max-w-xs">Building the video layer of the internet. Designed for
                        developers.</p>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4 text-sm">Product</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><a href="#" class="hover:text-brand-600">Features</a></li>
                        <li><a href="#" class="hover:text-brand-600">Pricing</a></li>
                        <li><a href="#" class="hover:text-brand-600">Showcase</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><a href="#" class="hover:text-brand-600">About</a></li>
                        <li><a href="#" class="hover:text-brand-600">Blog</a></li>
                        <li><a href="#" class="hover:text-brand-600">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4 text-sm">Legal</h4>
                    <ul class="space-y-2 text-sm text-slate-500">
                        <li><router-link to="/privacy" class="hover:text-brand-600">Privacy</router-link></li>
                        <li><router-link to="/terms" class="hover:text-brand-600">Terms</router-link></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
                &copy; 2026 EcoStream Inc. All rights reserved.
            </div>
        </div>
    </footer>

    <Head>
        <title>EcoStream - Video infrastructure for modern internet</title>
        <meta name="description"
            content="Seamlessly host, encode, and stream video with our developer-first API. Optimized for speed, built for scale." />
    </Head>
</template>
<script lang="ts" setup>
import { Head } from '@unhead/vue/components'
</script>
