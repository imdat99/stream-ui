<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Input from '@/components/ui/Input.vue';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: { currentPassword: string; newPassword: string }]
}>()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    error.value = ''
  }
})

const isValid = computed(() => {
  return currentPassword.value.length >= 1 
    && newPassword.value.length >= 6 
    && newPassword.value === confirmPassword.value
})

const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
})

const passwordTooShort = computed(() => {
  return newPassword.value.length > 0 && newPassword.value.length < 6
})

const newPasswordInvalidClass = computed(() => passwordTooShort.value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '')
const confirmPasswordInvalidClass = computed(() => passwordMismatch.value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '')

const handleSave = () => {
  if (!isValid.value) return
  loading.value = true
  error.value = ''
  emit('save', { 
    currentPassword: currentPassword.value, 
    newPassword: newPassword.value 
  })
}

const handleClose = () => {
  emit('update:visible', false)
}

// Expose methods for parent to control loading state
defineExpose({
  setLoading: (val: boolean) => { loading.value = val },
  setError: (msg: string) => { error.value = msg; loading.value = false }
})
</script>

<template>
  <Dialog
    :visible="visible"
    header="Change Password"
    width="28rem"
    :closable="true"
    :draggable="false"
    @update:visible="handleClose"
  >
    <div class="space-y-6 pt-2">
      <div
        v-if="error"
        class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      >
        {{ error }}
      </div>
      
      <div class="flex flex-col gap-2">
        <label for="current-password" class="text-sm font-medium text-gray-700">Current Password</label>
        <Input
          id="current-password"
          v-model="currentPassword"
          type="password"
          placeholder="Enter current password"
        />
      </div>
      
      <div class="flex flex-col gap-2">
        <label for="new-password" class="text-sm font-medium text-gray-700">New Password</label>
        <Input
          id="new-password"
          v-model="newPassword"
          type="password"
          placeholder="Enter new password (min 6 characters)"
          :class="newPasswordInvalidClass"
        />
        <small v-if="passwordTooShort" class="text-red-500">Password must be at least 6 characters</small>
      </div>
      
      <div class="flex flex-col gap-2">
        <label for="confirm-password" class="text-sm font-medium text-gray-700">Confirm New Password</label>
        <Input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          :class="confirmPasswordInvalidClass"
        />
        <small v-if="passwordMismatch" class="text-red-500">Passwords do not match</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" :disabled="loading" @click="handleClose">
          Cancel
        </Button>
        <Button :loading="loading" :disabled="!isValid" @click="handleSave">
          Change Password
        </Button>
      </div>
    </template>
  </Dialog>
</template>
