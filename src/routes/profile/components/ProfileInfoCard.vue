<script setup lang="ts">
import type { ModelUser } from '@/api/client'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { ref, watch } from 'vue'

interface Props {
  user: ModelUser | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  save: [data: { username: string; email: string }]
}>()

const isEditing = ref(false)
const username = ref('')
const email = ref('')

watch(() => props.user, (newUser) => {
  if (newUser) {
    username.value = newUser.username || ''
    email.value = newUser.email || ''
  }
}, { immediate: true })

const handleSave = () => {
  emit('save', { username: username.value, email: email.value })
  isEditing.value = false
}

const handleCancel = () => {
  username.value = props.user?.username || ''
  email.value = props.user?.email || ''
  isEditing.value = false
}
</script>

<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
      <Button
        v-if="!isEditing"
        size="sm"
        variant="outline"
        @click="isEditing = true"
      >
        Edit
      </Button>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <Input
          v-if="isEditing"
          v-model="username"
          placeholder="Enter username"
        />
        <p v-else class="text-gray-900">{{ user?.username || 'Not set' }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <Input
          v-if="isEditing"
          v-model="email"
          type="email"
          placeholder="Enter email"
        />
        <p v-else class="text-gray-900">{{ user?.email || 'Not set' }}</p>
      </div>

      <div v-if="isEditing" class="flex gap-2 pt-2">
        <Button size="sm" variant="outline" @click="handleCancel">Cancel</Button>
        <Button size="sm" @click="handleSave">Save</Button>
      </div>
    </div>
  </div>
</template>
