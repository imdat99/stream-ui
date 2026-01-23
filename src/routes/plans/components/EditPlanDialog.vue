<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    visible: boolean;
    plan: ModelPlan;
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'save', plan: ModelPlan): void;
}>();

// Create a local copy to edit
const localPlan = ref<ModelPlan>({});

// Sync when dialog opens or plan changes
watch(() => props.plan, (newPlan) => {
    localPlan.value = { ...newPlan };
}, { immediate: true });

const onSave = () => {
    emit('save', localPlan.value);
};

const visibleModel = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});
</script>

<template>
    <Dialog v-model:visible="visibleModel" modal header="Edit Plan" :style="{ width: '40rem' }">
        <div class="space-y-4">
            <div class="flex flex-col gap-2">
                <label for="plan-name" class="text-sm font-medium text-gray-700">Name</label>
                <InputText id="plan-name" v-model="localPlan.name" placeholder="Plan Name" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label for="plan-price" class="text-sm font-medium text-gray-700">Price ($)</label>
                    <InputNumber id="plan-price" v-model="localPlan.price" mode="currency" currency="USD" locale="en-US" :minFractionDigits="2" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="plan-cycle" class="text-sm font-medium text-gray-700">Billing Cycle</label>
                    <InputText id="plan-cycle" v-model="localPlan.cycle" placeholder="e.g. month, year" />
                </div>
            </div>

             <div class="flex flex-col gap-2">
                <label for="plan-desc" class="text-sm font-medium text-gray-700">Description</label>
                <Textarea id="plan-desc" v-model="localPlan.description" rows="2" class="w-full" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                 <div class="flex flex-col gap-2">
                    <label for="plan-storage" class="text-sm font-medium text-gray-700">Storage Limit (bytes)</label>
                    <InputNumber id="plan-storage" v-model="localPlan.storage_limit" />
                </div>
                 <div class="flex flex-col gap-2">
                    <label for="plan-uploads" class="text-sm font-medium text-gray-700">Upload Limit (per day)</label>
                    <InputNumber id="plan-uploads" v-model="localPlan.upload_limit" />
                </div>
                 <div class="flex flex-col gap-2">
                    <label for="plan-duration" class="text-sm font-medium text-gray-700">Duration Limit (sec)</label>
                    <InputNumber id="plan-duration" v-model="localPlan.duration_limit" />
                </div>
            </div>

             <div class="flex items-center gap-2 pt-2">
                 <Checkbox v-model="localPlan.is_active" :binary="true" inputId="plan-active" />
                 <label for="plan-active" class="text-sm font-medium text-gray-700">Active</label>
             </div>
        </div>

        <template #footer>
            <Button label="Cancel" text severity="secondary" @click="visibleModel = false" />
            <Button label="Save Changes" icon="i-heroicons-check" @click="onSave" :loading="loading" />
        </template>
    </Dialog>
</template>
