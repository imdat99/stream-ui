<script setup lang="ts">
import type { ModelPlan } from '@/api/client';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';

const props = defineProps<{
  visible: boolean
  currentPlan?: ModelPlan
  cancelling?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel-subscription'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="Manage Subscription"
    width="28rem"
    :closable="true"
    @update:visible="handleClose"
  >
    <div class="space-y-4">
      <div v-if="currentPlan" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-900">{{ currentPlan.name }}</h4>
        <p class="text-sm text-gray-500">${{ currentPlan.price }}/{{ currentPlan.cycle }}</p>
      </div>

      <div class="border-t border-gray-200 pt-4">
        <h4 class="font-medium text-gray-900 mb-2">Cancel Subscription</h4>
        <p class="text-sm text-gray-600 mb-4">
          If you cancel, you'll lose access to premium features at the end of your billing period.
        </p>
        <Button
          variant="danger"
          :loading="cancelling"
          @click="emit('cancel-subscription')"
        >
          Cancel Subscription
        </Button>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="handleClose">Close</Button>
    </template>
  </Dialog>
</template>
