<script setup lang="ts">
import type { ModelPlan } from '@/api/client';
import Button from '@/components/ui/Button.vue';
import Tag from '@/components/ui/Tag.vue';
import { computed } from 'vue';

const props = defineProps<{
  currentPlan?: ModelPlan
}>()

const emit = defineEmits<{
  (e: 'manage'): void
}>()

const planName = computed(() => props.currentPlan?.name || 'Free Plan')
const planPrice = computed(() => props.currentPlan?.price || 0)
const planCycle = computed(() => props.currentPlan?.cycle || 'month')
const isActive = computed(() => props.currentPlan?.is_active !== false)
</script>

<template>
  <div class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
    <div class="flex items-start justify-between mb-4">
      <div>
        <p class="text-blue-100 text-sm font-medium mb-1">Current Plan</p>
        <h3 class="text-3xl font-bold">{{ planName }}</h3>
      </div>
      <Tag
        :value="isActive ? 'Active' : 'Inactive'"
        :severity="isActive ? 'success' : 'danger'"
        class="!bg-white/20 !text-white !border-white/30"
      />
    </div>
    
    <div class="flex items-baseline gap-1 mb-6">
      <span class="text-4xl font-bold">${{ planPrice }}</span>
      <span class="text-blue-100">/{{ planCycle }}</span>
    </div>

    <Button variant="outline" class="!text-white !border-white/50 hover:!bg-white/20" @click="emit('manage')">
      Manage Subscription
    </Button>
  </div>
</template>
