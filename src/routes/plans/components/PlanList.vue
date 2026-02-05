<script setup lang="ts">
import type { ModelPlan } from '@/api/client';
import Button from '@/components/ui/Button.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { formatBytes } from '@/lib/utils';

const props = defineProps<{
  plans: ModelPlan[]
  isLoading: boolean
  currentPlanId?: string
  subscribingPlanId?: string | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'subscribe', plan: ModelPlan): void
  (e: 'edit', plan: ModelPlan): void
}>()
</script>

<template>
  <section>
    <h2 class="text-2xl font-bold mb-6 text-gray-900">Available Plans</h2>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-xl p-6">
        <Skeleton height="1.5rem" width="60%" class="mb-4" />
        <Skeleton height="2rem" width="40%" class="mb-6" />
        <Skeleton height="1rem" class="mb-2" />
        <Skeleton height="1rem" class="mb-2" />
        <Skeleton height="1rem" width="80%" class="mb-6" />
        <Skeleton height="2.5rem" />
      </div>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white border rounded-xl p-6 transition-all hover:shadow-lg"
        :class="plan.id === currentPlanId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'"
      >
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ plan.name }}</h3>
            <p class="text-sm text-gray-500">{{ plan.cycle }}</p>
          </div>
          <div v-if="plan.id === currentPlanId" class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Current
          </div>
        </div>

        <div class="mb-6">
          <span class="text-3xl font-bold text-gray-900">${{ plan.price }}</span>
          <span class="text-gray-500">/{{ plan.cycle }}</span>
        </div>

        <p class="text-sm text-gray-600 mb-6">{{ plan.description }}</p>

        <div class="space-y-2 mb-6 text-sm">
          <div class="flex items-center gap-2">
            <span class="i-heroicons-check-circle text-green-500 w-4 h-4" />
            <span>{{ formatBytes(plan.storage_limit || 0) }} storage</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="i-heroicons-check-circle text-green-500 w-4 h-4" />
            <span>{{ plan.upload_limit }} uploads/day</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="i-heroicons-check-circle text-green-500 w-4 h-4" />
            <span>{{ plan.duration_limit }}s video duration</span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            v-if="isAdmin"
            variant="outline"
            class="flex-1"
            @click="emit('edit', plan)"
          >
            Edit
          </Button>
          <Button
            class="flex-1"
            :variant="plan.id === currentPlanId ? 'outline' : 'primary'"
            :loading="subscribingPlanId === plan.id"
            :disabled="plan.id === currentPlanId"
            @click="emit('subscribe', plan)"
          >
            {{ plan.id === currentPlanId ? 'Current Plan' : 'Subscribe' }}
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
