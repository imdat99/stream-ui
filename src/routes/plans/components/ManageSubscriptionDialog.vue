<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { computed } from 'vue';

const props = defineProps<{
    visible: boolean;
    currentPlan?: ModelPlan;
    cancelling?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'cancel-subscription'): void;
}>();

const visibleModel = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
</script>

<template>
    <Dialog v-model:visible="visibleModel" modal header="Manage Subscription" :style="{ width: '30rem' }">
        <div class="mb-4">
            <p class="text-gray-600 mb-4">You are currently subscribed to <span class="font-bold text-gray-900">{{ currentPlan?.name }}</span>.</p>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Status</span>
                    <span class="text-sm font-medium text-green-600">Active</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Renewal Date</span>
                    <span class="text-sm font-medium text-gray-900">Feb 24, 2026</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Amount</span>
                    <span class="text-sm font-medium text-gray-900">${{ currentPlan?.price || 0 }}/mo</span>
                </div>
            </div>
        </div>
        <p class="text-sm text-gray-600 mb-6">
            Canceling your subscription will downgrade you to the Free plan at the end of your current billing period.
        </p>
        <div class="flex justify-end gap-2">
            <Button label="Close" text severity="secondary" @click="visibleModel = false" />
            <Button 
                label="Cancel Subscription" 
                severity="danger" 
                :icon="cancelling ? 'i-svg-spinners-180-ring-with-bg' : 'i-heroicons-x-circle'" 
                @click="emit('cancel-subscription')" 
                :disabled="cancelling"
            />
        </div>
    </Dialog>
</template>
