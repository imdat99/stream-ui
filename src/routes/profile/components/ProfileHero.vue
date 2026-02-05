<script setup lang="ts">
import type { ModelUser } from '@/api/client';
import { Avatar, Button, Tag } from '@/components/ui/form';
import { computed } from 'vue';

const props = defineProps<{
    user: ModelUser | null;
}>();

const emit = defineEmits<{
    logout: [];
    changePassword: [];
}>();

const joinDate = computed(() => {
    return new Date(props.user?.created_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});
</script>

<template>
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 md:p-10">
        <!-- Background decorations -->
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div class="relative">
                <div class="absolute inset-0 bg-primary-500 rounded-full blur-lg opacity-40"></div>
                <Avatar 
                    size="large"
                    shape="circle"
                    label=""
                />
            </div>
            
            <div class="text-center md:text-left space-y-2 flex-grow">
                <div class="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                    <h2 class="text-3xl font-bold text-white">{{ user?.username || 'User' }}</h2>
                    <Tag :value="user?.role || 'User'" severity="info" />
                </div>
                <p class="text-gray-400 text-lg">{{ user?.email }}</p>
                <p class="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                        <line x1="16" x2="16" y1="2" y2="6"/>
                        <line x1="8" x2="8" y1="2" y2="6"/>
                        <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    Member since {{ joinDate }}
                </p>
            </div>

            <div class="flex gap-3">
                <Button label="Logout" @click="emit('logout')">
                    <template #default>
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                    </template>
                </Button>
            </div>
        </div>
    </div>
</template>
