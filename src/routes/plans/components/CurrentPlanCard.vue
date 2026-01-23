<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

defineProps<{
    currentPlan?: ModelPlan;
}>();

defineEmits<{
    (e: 'manage'): void;
}>();
</script>

<template>
    <div class="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 shadow-xl">
        <!-- Background decorations -->
        <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        <div class="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

        <div class="relative z-10 flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
                <div>
                    <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Current Plan</h2>
                    <h3 class="text-4xl font-bold text-white mb-2">{{ currentPlan?.name || 'Standard Plan' }}</h3>
                    <Tag value="Active" severity="success" class="px-3" rounded></Tag>
                </div>
                <div class="text-right">
                    <div class="text-3xl font-bold text-white">${{ currentPlan?.price || 0 }}<span class="text-lg text-gray-400 font-normal">/mo</span></div>
                    <p class="text-gray-400 text-sm mt-1">Next billing on Feb 24, 2026</p>
                </div>
            </div>
            
            <div class="mt-8 pt-8 border-t border-gray-700/50 flex gap-4">
                <Button label="Manage Subscription" severity="secondary" class="bg-white/10 border-white/10 text-white hover:bg-white/20" @click="$emit('manage')" />
            </div>
        </div>
    </div>
</template>
