<script setup lang="ts">
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, inject, ref } from 'vue';
import AccountStatusCard from './components/AccountStatusCard.vue';
import ChangePasswordDialog from './components/ChangePasswordDialog.vue';
import LinkedAccountsCard from './components/LinkedAccountsCard.vue';
import ProfileHero from './components/ProfileHero.vue';
import ProfileInfoCard from './components/ProfileInfoCard.vue';

const auth = useAuthStore();
const toast = inject<{ add: (t: any) => void }>('toast');

// Dialog visibility
const showPasswordDialog = ref(false);

// Refs for dialog components
const passwordDialogRef = ref<any>();

// Computed storage values
const storageUsed = computed(() => auth.user?.storage_used || 0);
const storageLimit = computed(() => 10737418240); // 10GB default

// Handlers
const handleEditSave = async (data: { username: string; email: string }) => {
    try {
        await auth.updateProfile(data);
        toast?.add({
            severity: 'success',
            summary: 'Profile Updated',
            detail: 'Your profile has been updated successfully.',
            life: 3000
        });
    } catch (e) {
        toast?.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: auth.error || 'Failed to update profile.',
            life: 5000
        });
    }
};

const handlePasswordSave = async (data: { currentPassword: string; newPassword: string }) => {
    try {
        await auth.changePassword(data.currentPassword, data.newPassword);
        showPasswordDialog.value = false;
        toast?.add({
            severity: 'success',
            summary: 'Password Changed',
            detail: 'Your password has been changed successfully.',
            life: 3000
        });
    } catch (e: any) {
        if (passwordDialogRef.value?.setError) {
            passwordDialogRef.value.setError(e.message || 'Failed to change password');
        }
    }
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
            <ProfileHero 
                :user="auth.user" 
                @logout="auth.logout()" 
            />

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Personal Info -->
                <div class="md:col-span-2">
                    <ProfileInfoCard 
                        :user="auth.user" 
                        @change-password="showPasswordDialog = true"
                    />
                </div>

                <!-- Stats Side -->
                <div class="md:col-span-1 space-y-6">
                    <AccountStatusCard 
                        :storage-used="storageUsed" 
                        :storage-limit="storageLimit" 
                    />
                    <LinkedAccountsCard />
                </div>
            </div>
        </div>

        <!-- Dialogs -->
        <ChangePasswordDialog 
            ref="passwordDialogRef"
            v-model:visible="showPasswordDialog"
            @save="handlePasswordSave"
        />
    </div>
</template>
