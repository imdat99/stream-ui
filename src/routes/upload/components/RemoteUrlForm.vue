<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{ maxUrls?: number }>();
const urls = ref('');

const emit = defineEmits<{ submit: [urls: string[]] }>();
const { t } = useTranslation();

const handleSubmit = () => {
    const limit = props.maxUrls ?? 5;
    const urlList = urls.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .slice(0, limit);
    if (urlList.length > 0) {
        emit('submit', urlList);
        urls.value = '';
    }
};
</script>

<template>
    <div class="flex flex-col gap-3 h-full">
        <div class="relative flex-1">
            <textarea
                v-model="urls"
                :placeholder="t('upload.remote.placeholder')"
                class="w-full h-full min-h-[200px] px-4 py-3.5 bg-white border border-slate-200
                       rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/10 focus:outline-none
                       transition-all resize-none text-base text-slate-700 placeholder:text-slate-300
                       leading-relaxed font-[inherit]"
            />
        </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-slate-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
                {{ t('upload.remote.providersHint') }}
            </div>
            <button
                @click="handleSubmit"
                class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white
                       text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                </svg>
                {{ t('upload.remote.addUrls') }}
            </button>
        </div>
    </div>
</template>
