<script setup lang="ts">
import type { ModelUser } from '@/api/client';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

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
                <Button label="Change Password" text severity="secondary" @click="emit('changePassword')">
                    <template #icon>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </template>
                </Button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col gap-2">
                <label for="username" class="text-sm font-medium text-gray-700">Username</label>
                <div class="relative">
                     <IconField>
                        <InputIcon>
                           <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        </InputIcon>
                        <InputText id="username" :value="user?.username" class="w-full pl-10" readonly />
                    </IconField>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <label for="email" class="text-sm font-medium text-gray-700">Email Address</label>
                <div class="relative">
                    <IconField>
                        <InputIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2"/>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                        </InputIcon>
                        <InputText id="email" :value="user?.email" class="w-full pl-10" readonly />
                    </IconField>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <!-- <div class="flex flex-col gap-2">
                    <label for="role" class="text-sm font-medium text-gray-700">Role</label>
                    <InputText id="role" :value="user?.role || 'User'" class="w-full capitalize bg-gray-50" readonly />
                </div> -->
                <!-- <div class="flex flex-col gap-2">
                    <label for="id" class="text-sm font-medium text-gray-700">User ID</label>
                    <InputText id="id" :value="user?.id || 'N/A'" class="w-full font-mono text-sm bg-gray-50" readonly />
                </div> -->
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-inputtext[readonly]) {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
}
</style>
