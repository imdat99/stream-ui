<script setup lang="ts">
const emit = defineEmits<{
    filesSelected: [files: FileList];
}>();

const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        emit('filesSelected', input.files);
    }
};
</script>

<template>
    <div class="relative group cursor-pointer">
        <input type="file" multiple accept="video/*"
            class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" @change="handleFileChange">

        <div
            class="bg-surface rounded-2xl p-16 text-center border border-dashed border-border group-hover:border-success/50 group-hover:shadow-soft transition-all duration-300 relative overflow-hidden">

            <div
                class="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            </div>
            <div
                class="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            </div>

            <div class="relative z-10 flex flex-col items-center">
                <div
                    class="w-24 h-24 mb-8 rounded-3xl bg-page shadow-soft flex items-center justify-center text-accent transition-all duration-300 ring-4 ring-gray-100 group-hover:(ring-primary/10 scale-110 shadow-md)">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="w-10 h-10 stroke-primary/60 group-hover:stroke-primary transition-all duration-300"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                </div>

                <h3 class="text-2xl font-semibold text-slate-900 mb-3">Drag and drop your videos here</h3>
                <p class="text-slate-500 text-base mb-8 max-w-md mx-auto leading-relaxed">
                    Supports uploading multiple files at once. Formats MP4, MOV, MKV. Up to 10GB per file.
                </p>
                <span class="px-8 py-3.5 btn-lg btn-primary flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                            d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                    Choose Files
                </span>
            </div>
        </div>
    </div>
</template>
