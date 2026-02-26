<script setup lang="ts">
const props = defineProps<{ maxFiles?: number }>();
const emit = defineEmits<{ filesSelected: [files: FileList] }>();


const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const limit = props.maxFiles ?? 5;
    if (input.files.length > limit) {
        // Create a DataTransfer to slice to the limit
        const dt = new DataTransfer();
        Array.from(input.files).slice(0, limit).forEach(f => dt.items.add(f));
        emit('filesSelected', dt.files);
    } else {
        emit('filesSelected', input.files);
    }
};
</script>

<template>
    <div class="relative group cursor-pointer flex-1 flex flex-col h-full">
        <input type="file" multiple accept="video/*"
            class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" @change="handleFileChange">

        <div class="flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed
                    border-slate-200 group-hover:border-accent/60 group-hover:bg-accent/[0.03]
                    transition-all duration-300 py-6 px-4 h-full">

            <!-- Animated icon -->
            <div class="relative">
                <div class="w-20 h-20 rounded-2xl bg-slate-100 group-hover:bg-accent/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="w-10 h-10 text-slate-400 group-hover:text-accent transition-colors duration-300"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                </div>
                <div class="absolute inset-0 rounded-2xl ring-4 ring-accent/0 group-hover:ring-accent/20 transition-all duration-300"></div>
            </div>

            <div class="text-center">
                <p class="text-base font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Drop videos here
                </p>
                <p class="text-sm text-slate-400 mt-1.5">or click anywhere to browse</p>
            </div>

            <!-- Format badges -->
            <div class="flex items-center gap-2">
                <span v-for="fmt in ['MP4', 'MOV', 'MKV']" :key="fmt"
                    class="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-500 rounded-lg tracking-wide">
                    {{ fmt }}
                </span>
            </div>
        </div>
    </div>
</template>
