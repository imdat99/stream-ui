<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUploadQueue } from '@/composables/useUploadQueue';
import { useRoute, useRouter } from 'vue-router';
import UploadQueueItem from '@/routes/upload/components/UploadQueueItem.vue';

const { items, totalSize, completeCount, pendingCount } = useUploadQueue();
const route = useRoute();
const router = useRouter();

const isOpen = ref(false);

const isVisible = computed(() => {
    // Show if there are items AND we are NOT on the upload page
    return items.value.length > 0 && route.path !== '/upload';
});

const progress = computed(() => {
    if (items.value.length === 0) return 0;
    const totalProgress = items.value.reduce((acc, item) => acc + (item.progress || 0), 0);
    return Math.round(totalProgress / items.value.length);
});

const isUploading = computed(() => {
    return items.value.some(i => i.status === 'uploading' || i.status === 'fetching');
});

const toggleOpen = () => {
    isOpen.value = !isOpen.value;
};

const goToUploadPage = () => {
    router.push('/upload');
    isOpen.value = false;
};
</script>

<template>
    <div v-if="isVisible" class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        <!-- Mini Queue Popover -->
        <Transition enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95">
            <div v-if="isOpen"
                class="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mb-2 w-80 max-h-[60vh] flex flex-col">
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <h3 class="font-bold text-slate-800">Uploads</h3>
                    <button @click="goToUploadPage" class="text-xs font-bold text-accent hover:underline">
                        View All
                    </button>
                </div>

                <div
                    class="flex-1 overflow-y-auto min-h-0 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded">
                    <UploadQueueItem v-for="item in items" :key="item.id" :item="item" :minimal="true"
                        class="border-b border-slate-100 last:border-0 !rounded-none" />
                </div>
            </div>
        </Transition>

        <!-- Floating Button -->
        <button @click="toggleOpen"
            class="relative flex items-center gap-3 bg-white pl-4 pr-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 hover:-translate-y-1 transition-all duration-300 group">
            <!-- Progress Ring -->
            <div class="relative w-10 h-10 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90 text-slate-100" viewBox="0 0 36 36">
                    <path class="stroke-current" fill="none" stroke-width="3"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <svg class="absolute inset-0 w-full h-full -rotate-90 text-accent transition-all duration-500"
                    viewBox="0 0 36 36" :style="{ strokeDasharray: `${progress}, 100` }">
                    <path class="stroke-current" fill="none" stroke-width="3" stroke-linecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>

                <div class="absolute inset-0 flex items-center justify-center text-accent">
                    <svg v-if="!isUploading && completeCount === items.length" xmlns="http://www.w3.org/2000/svg"
                        class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span v-else class="text-[10px] font-bold">{{ progress }}%</span>
                </div>
            </div>

            <div class="text-left">
                <div class="text-sm font-bold text-slate-800 group-hover:text-accent transition-colors">
                    {{ isUploading ? 'Uploading...' : (completeCount === items.length ? 'Completed' : 'Pending') }}
                </div>
                <div class="text-xs text-slate-500">
                    {{ completeCount }} / {{ items.length }} files
                </div>
            </div>

            <div v-if="pendingCount"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white">
                {{ pendingCount }}
            </div>
        </button>
    </div>
</template>
