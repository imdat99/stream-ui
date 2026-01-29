<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed } from 'vue';

const props = defineProps<{
    modelValue: 'local' | 'remote';
}>();

const emit = defineEmits<{
    'update:modelValue': [value: 'local' | 'remote'];
}>();

const modeList: { id: 'local' | 'remote'; label: string; icon: string }[] = [
    {
        id: 'local',
        label: 'Local Upload',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 8v8"/><path d="m8 12 4-4 4 4"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><rect width="6" height="6" x="16" y="16" rx="1"/></svg>`
    },
    {
        id: 'remote',
        label: 'Remote URL',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
    }
];

const mode = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>

<template>
    <div class="inline-flex bg-gray-200 p-1 rounded-2xl relative z-0 w-fit">
        <div
            :class="cn(':uno: absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out -z-10', mode === 'local' ? 'translate-x-0' : 'translate-x-full')">
        </div>
        <button v-for="item in modeList" :key="item.id" @click="mode = item.id"
            :class="cn('flex items-center gap-2 px-6 py-3 text-sm rounded-xl transition-colors relative z-10', mode === item.id ? 'font-semibold text-slate-900' : 'font-medium text-slate-500 hover:text-slate-900 ')">
            <span class="w-5 h-5" v-html="item.icon"></span>
            {{ item.label }}
        </button>
    </div>
</template>
