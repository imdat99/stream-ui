<script setup lang="ts">
import type { ModelUser } from '@/api/client'
import Avatar from '@/components/ui/Avatar.vue'
import Button from '@/components/ui/Button.vue'
import Tag from '@/components/ui/Tag.vue'
import { computed } from 'vue'

interface Props {
  user: ModelUser | null
}

const props = defineProps<Props>()

const displayName = computed(() => {
  return props.user?.username || 'User'
})

const displayEmail = computed(() => {
  return props.user?.email || 'No email'
})
</script>

<template>
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
    <div class="flex items-center gap-4">
      <Avatar
        :label="displayName"
        size="xl"
        shape="circle"
        class="border-4 border-white/30"
      />
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-bold">{{ displayName }}</h2>
          <Tag value="Active" severity="success" class="!bg-white/20 !text-white !border-white/30" />
        </div>
        <p class="text-white/80">{{ displayEmail }}</p>
      </div>
      <Button variant="ghost" class="!text-white hover:!bg-white/20">
        Edit Profile
      </Button>
    </div>
  </div>
</template>
