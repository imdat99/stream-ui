<script setup lang="ts">
import { type ModelPlan } from '@/api/client'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Dialog from '@/components/ui/Dialog.vue'
import Input from '@/components/ui/Input.vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  plan: ModelPlan
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'save', plan: ModelPlan): void
}>()

// Create a local copy to edit
const localPlan = ref<ModelPlan>({} as ModelPlan)

// Sync when dialog opens or plan changes
watch(() => props.plan, (newPlan) => {
  localPlan.value = { ...newPlan }
}, { immediate: true })

const onSave = () => {
  emit('save', localPlan.value)
}

const handleClose = () => {
  emit('update:visible', false)
}

const isActive = computed({
  get: () => localPlan.value.is_active ?? false,
  set: (val: boolean) => {
    localPlan.value.is_active = val
  }
})
</script>

<template>
  <Dialog
    :visible="visible"
    header="Edit Plan"
    width="40rem"
    :closable="true"
    @update:visible="handleClose"
  >
    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label for="plan-name" class="text-sm font-medium text-gray-700">Name</label>
        <Input id="plan-name" v-model="localPlan.name" placeholder="Plan Name" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label for="plan-price" class="text-sm font-medium text-gray-700">Price ($)</label>
          <Input id="plan-price" :model-value="localPlan.price ?? ''" type="number" placeholder="0.00" @update:model-value="localPlan.price = Number($event)" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="plan-cycle" class="text-sm font-medium text-gray-700">Billing Cycle</label>
          <Input id="plan-cycle" v-model="localPlan.cycle" placeholder="e.g. month, year" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="plan-desc" class="text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="plan-desc"
          v-model="localPlan.description"
          rows="2"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label for="plan-storage" class="text-sm font-medium text-gray-700">Storage Limit (bytes)</label>
          <Input id="plan-storage" :model-value="localPlan.storage_limit ?? ''" type="number" @update:model-value="localPlan.storage_limit = Number($event)" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="plan-uploads" class="text-sm font-medium text-gray-700">Upload Limit (per day)</label>
          <Input id="plan-uploads" :model-value="localPlan.upload_limit ?? ''" type="number" @update:model-value="localPlan.upload_limit = Number($event)" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="plan-duration" class="text-sm font-medium text-gray-700">Duration Limit (sec)</label>
          <Input id="plan-duration" :model-value="localPlan.duration_limit ?? ''" type="number" @update:model-value="localPlan.duration_limit = Number($event)" />
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <Checkbox v-model="isActive" :binary="true" />
        <label class="text-sm font-medium text-gray-700">Active</label>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button :loading="loading" @click="onSave">Save Changes</Button>
      </div>
    </template>
  </Dialog>
</template>
