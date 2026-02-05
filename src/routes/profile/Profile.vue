<script setup lang="ts">
import PageHeader from '@/components/dashboard/PageHeader.vue'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import AccountStatusCard from './components/AccountStatusCard.vue'
import ChangePasswordDialog from './components/ChangePasswordDialog.vue'
import LinkedAccountsCard from './components/LinkedAccountsCard.vue'
import ProfileHero from './components/ProfileHero.vue'
import ProfileInfoCard from './components/ProfileInfoCard.vue'

const auth = useAuthStore()
const toast = useToast()

// Dialog visibility
const showPasswordDialog = ref(false)

// Refs for dialog components
const passwordDialogRef = ref<InstanceType<typeof ChangePasswordDialog>>()

// Computed storage values
const storageUsed = computed(() => auth.user?.storage_used || 0)
const storageLimit = computed(() => 10737418240) // 10GB default

// Handlers
const handleEditSave = async (data: { username: string; email: string }) => {
  try {
    await auth.updateProfile(data)
    toast.success('Your profile has been updated successfully.', 'Profile Updated')
  } catch (e) {
    toast.error(auth.error || 'Failed to update profile.', 'Update Failed')
  }
}

const handlePasswordSave = async (data: { currentPassword: string; newPassword: string }) => {
  try {
    await auth.changePassword(data.currentPassword, data.newPassword)
    showPasswordDialog.value = false
    toast.success('Your password has been changed successfully.', 'Password Changed')
  } catch (e: any) {
    passwordDialogRef.value?.setError(e.message || 'Failed to change password')
  }
}
</script>

<template>
  <div class="profile-page">
    <Toast />
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
