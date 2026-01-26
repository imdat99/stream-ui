<script setup lang="ts">
import { ref } from 'vue';

const urls = ref('');

const emit = defineEmits<{
    submit: [urls: string[]];
}>();

const handleSubmit = () => {
    const urlList = urls.value
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    if (urlList.length > 0) {
        emit('submit', urlList);
    }
};
</script>

<template>
    <div class="bg-gradient-to-tl from-slate-50 to-white rounded-[2rem] shadow-soft p-10 border border-gray-200">
        <label class="block text-lg font-semibold text-slate-900 mb-4">Enter Video URL</label>

        <div class="flex gap-4 items-start">
            <div class="flex-1 relative group">
                <div class="absolute left-4 top-4 text-slate-400 group-focus-within:text-accent transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                        <path d="M2 12h20" />
                    </svg>
                </div>
                <textarea v-model="urls"
                    placeholder="Paste one or more links (one per line)...&#10;https://drive.google.com/file/..."
                    class="w-full pl-12 pr-4 py-4 h-32 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-accent focus:bg-white focus:ring-0 transition-all resize-none text-slate-800 placeholder:text-slate-400 text-base leading-relaxed font-medium"></textarea>
            </div>
        </div>

        <div class="mt-6 flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
                Auto-detect Google Drive, Dropbox
            </div>
            <button @click="handleSubmit"
                class="px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-medium rounded-xl shadow-xl shadow-slate-200/50 transition-all active:scale-95 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-300" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path
                        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                    <path d="M20 3v4" />
                    <path d="M22 5h-4" />
                    <path d="M4 17v2" />
                    <path d="M5 18H3" />
                </svg>
                Import & Upload Videos
            </button>
        </div>
    </div>
</template>
