<script setup lang="ts">
import type { ModelUser } from '@/api/client';
import { Button } from '@/components/ui/form';

defineProps<{
    user: ModelUser | null;
}>();

const emit = defineEmits<{
    edit: [];
    changePassword: [];
}>();
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-2xl p-8">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Personal Information</h3>
            <div class="flex gap-2">
                <Button variant="text" @click="emit('changePassword')">
                    <template #default>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Change Password
                    </template>
                </Button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">Username</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        :value="user?.username" 
                        readonly
                        class="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none"
                    />
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">Email Address</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        :value="user?.email" 
                        readonly
                        class="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
