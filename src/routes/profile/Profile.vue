<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';

const auth = useAuthStore();

// Computed for display
const joinDate = computed(() => {
    return new Date(auth.user?.created_at || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240); // 10GB default
const storagePercentage = computed(() => Math.min(Math.round((storageUsed.value / storageLimit.value) * 100), 100));

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="profile-page">
        <PageHeader 
            title="Profile Settings" 
            description="Manage your account information and preferences." 
            :breadcrumbs="[
                { label: 'Dashboard', to: '/' },
                { label: 'Profile' }
            ]" 
        />
        
        <div class="max-w-5xl mx-auto space-y-8 pb-12">
            
            <!-- Hero Identity Card -->
            <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 md:p-10 shadow-xl">
                 <!-- Background decorations -->
                 <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                 <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                 <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
                     <div class="relative">
                         <div class="absolute inset-0 bg-primary-500 rounded-full blur-lg opacity-40"></div>
                         <Avatar 
                            :label="auth.user?.username?.charAt(0).toUpperCase() || 'U'" 
                            class="relative border-4 border-gray-800 text-3xl font-bold bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-2xl" 
                            size="xlarge" 
                            shape="circle"
                            style="width: 120px; height: 120px; font-size: 3rem;"
                        />
                     </div>
                     
                     <div class="text-center md:text-left space-y-2 flex-grow">
                         <div class="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                             <h2 class="text-3xl font-bold text-white">{{ auth.user?.username || 'User' }}</h2>
                             <Tag :value="auth.user?.role || 'User'" severity="info" class="uppercase tracking-wider px-2 header-tag" rounded></Tag>
                         </div>
                         <p class="text-gray-400 text-lg">{{ auth.user?.email }}</p>
                         <p class="text-gray-500 text-sm flex items-center justify-center md:justify-start gap-2">
                             <span class="i-heroicons-calendar"></span>
                             Member since {{ joinDate }}
                         </p>
                     </div>

                     <div class="flex gap-3">
                         <Button label="Logout" icon="i-heroicons-arrow-right-on-rectangle" severity="secondary" class="border-white/10 text-white hover:bg-white/10 bg-white/5" @click="auth.logout()" />
                     </div>
                 </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Personal Info -->
                 <div class="md:col-span-2">
                     <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                         <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-gray-900">Personal Information</h3>
                            <Button label="Edit Profile" icon="i-heroicons-pencil" text severity="secondary" disabled />
                         </div>
                         
                         <div class="grid grid-cols-1 gap-6">
                             <div class="flex flex-col gap-2">
                                <label for="username" class="text-sm font-medium text-gray-700">Username</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 i-heroicons-user"></span>
                                    <InputText id="username" :value="auth.user?.username" class="w-full pl-10" readonly />
                                </div>
                             </div>
                             <div class="flex flex-col gap-2">
                                <label for="email" class="text-sm font-medium text-gray-700">Email Address</label>
                                <div class="relative">
                                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 i-heroicons-envelope"></span>
                                    <InputText id="email" :value="auth.user?.email" class="w-full pl-10" readonly />
                                </div>
                             </div>
                              <div class="grid grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label for="role" class="text-sm font-medium text-gray-700">Role</label>
                                    <InputText id="role" :value="auth.user?.role || 'User'" class="w-full capitalize bg-gray-50" readonly />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="id" class="text-sm font-medium text-gray-700">User ID</label>
                                    <InputText id="id" :value="auth.user?.id || 'N/A'" class="w-full font-mono text-sm bg-gray-50" readonly />
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!-- Stats Side -->
                 <div class="md:col-span-1 space-y-6">
                     <!-- Account Status -->
                     <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                         <h3 class="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
                         <div class="space-y-4">
                             <div>
                                 <div class="flex justify-between text-sm mb-2">
                                     <span class="text-gray-600">Storage Used</span>
                                     <span class="font-bold text-gray-900">{{ storagePercentage }}%</span>
                                 </div>
                                 <ProgressBar :value="storagePercentage" :showValue="false" style="height: 6px"></ProgressBar>
                                 <p class="text-xs text-gray-500 mt-2">{{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used</p>
                             </div>
                             <div class="bg-green-50 rounded-lg p-4 border border-green-100 flex items-start gap-3">
                                 <span class="i-heroicons-check-circle text-green-600 text-xl mt-0.5"></span>
                                 <div>
                                     <h4 class="font-bold text-green-800 text-sm">Account Active</h4>
                                     <p class="text-green-600 text-xs mt-0.5">Your subscription is in good standing.</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                     
                     <!-- Linked Accounts (Mock) -->
                     <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                         <h3 class="text-lg font-bold text-gray-900 mb-4">Linked Accounts</h3>
                         <div class="space-y-3">
                             <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                 <div class="flex items-center gap-3">
                                     <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">G</div>
                                     <span class="font-medium text-gray-700">Google</span>
                                 </div>
                                 <Tag value="Connected" severity="success" class="text-xs px-2"></Tag>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom override for PrimeVue Avatar size if class utils fail */
:deep(.p-avatar-xl) {
    width: 6rem;
    height: 6rem;
}
:deep(.header-tag) {
    background: rgba(255,255,255,0.2) !important;
    color: white !important;
    border: 1px solid rgba(255,255,255,0.1);
}
:deep(.p-inputtext[readonly]) {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
}
</style>
