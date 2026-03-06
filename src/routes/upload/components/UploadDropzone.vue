<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{ maxFiles?: number }>();
const emit = defineEmits<{ filesSelected: [files: FileList] }>();
const { t } = useTranslation();

const isDragOver = ref(false);
let dragCounter = 0;

const toVideoFiles = (files: FileList | null | undefined): FileList | null => {
    if (!files?.length) return null;
    const limit = props.maxFiles ?? 5;
    const dt = new DataTransfer();
    Array.from(files)
        .filter(f => f.type.startsWith('video/'))
        .slice(0, limit)
        .forEach(f => dt.items.add(f));
    return dt.files.length ? dt.files : null;
};

const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = toVideoFiles(input.files);
    if (files) emit('filesSelected', files);
    input.value = ''; // reset so same file can be re-selected
};

const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragCounter++;
    isDragOver.value = true;
};

const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        dragCounter = 0;
        isDragOver.value = false;
    }
};

const onDragOver = (e: DragEvent) => {
    e.preventDefault(); // required to allow drop
    e.stopPropagation();
};

const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    isDragOver.value = false;
    const files = toVideoFiles(e.dataTransfer?.files);
    if (files) emit('filesSelected', files);
};
</script>

<template>
    <div class="relative group cursor-pointer flex-1 flex flex-col h-full"
        @dragenter="onDragEnter" @dragleave="onDragLeave" @dragover="onDragOver" @drop="onDrop">
        <input type="file" multiple accept="video/*"
            class="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" @change="handleFileChange">

        <div :class="[
            'flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-all duration-200 py-6 px-4 h-full',
            isDragOver
                ? 'border-accent bg-accent/5 scale-[0.99]'
                : 'border-slate-200 group-hover:border-accent/60 group-hover:bg-accent/[0.03]'
        ]">

            <!-- Animated icon -->
            <div class="relative">
                <div :class="[
                    'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200',
                    isDragOver ? 'bg-accent/10 scale-110 shadow-md' : 'bg-slate-100 group-hover:bg-accent/10 group-hover:scale-105 group-hover:shadow-md'
                ]">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        :class="['w-10 h-10 transition-colors duration-200', isDragOver ? 'text-accent' : 'text-slate-400 group-hover:text-accent']"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                </div>
                <div :class="[
                    'absolute inset-0 rounded-2xl ring-4 transition-all duration-200',
                    isDragOver ? 'ring-accent/30' : 'ring-accent/0 group-hover:ring-accent/20'
                ]"></div>
            </div>

            <div class="text-center">
                <p :class="['text-base font-semibold transition-colors', isDragOver ? 'text-accent' : 'text-slate-700 group-hover:text-slate-900']">
                    {{ isDragOver ? t('upload.dropzone.releaseToAdd') : t('upload.dropzone.dropHere') }}
                </p>
                <p class="text-sm text-slate-400 mt-1.5">{{ t('upload.dropzone.browse') }}</p>
            </div>

            <!-- Format badges -->
            <div class="flex items-center gap-2">
                <span v-for="fmt in ['MP4', 'MOV', 'MKV']" :key="fmt"
                    :class="['text-xs font-semibold px-3 py-1 rounded-lg tracking-wide transition-colors', isDragOver ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500']">
                    {{ fmt }}
                </span>
            </div>
        </div>
    </div>
</template>
