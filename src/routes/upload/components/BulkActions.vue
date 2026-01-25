<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    pendingCount?: number;
    visible?: boolean;
}>();

const category = ref('');
const visibility = ref('public');
</script>

<template>
    <div id="bulk-actions" class="mt-10" :class="{ 'hidden opacity-0 translate-y-4': !visible }"
        style="transition: all 500ms;">
        <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
            <div>
                <h4 class="text-lg font-semibold text-slate-900">Quick Settings</h4>
                <p class="text-slate-500 text-sm">Apply to {{ pendingCount || 0 }} pending files</p>
            </div>
            <div class="flex gap-3">
                <select v-model="category"
                    class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                    <option value="">Select category...</option>
                    <option value="learning">Learning</option>
                    <option value="entertainment">Entertainment</option>
                </select>
                <select v-model="visibility"
                    class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
        </div>
    </div>
</template>
