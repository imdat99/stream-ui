<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import { Button, Dialog } from '@/components/ui/form';
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
    <Dialog v-model:visible="visibleModel" header="Edit Plan" :style="{ width: '40rem' }">
        <div class="space-y-4">
            <div class="flex flex-col gap-2">
                <label for="plan-name" class="text-sm font-medium text-gray-700">Name</label>
                <input 
                    id="plan-name"
                    v-model="localPlan.name"
                    type="text"
                    placeholder="Plan Name"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label for="plan-price" class="text-sm font-medium text-gray-700">Price ($)</label>
                    <input 
                        id="plan-price"
                        v-model="localPlan.price"
                        type="number"
                        placeholder="Price"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="plan-cycle" class="text-sm font-medium text-gray-700">Billing Cycle</label>
                    <input 
                        id="plan-cycle"
                        v-model="localPlan.cycle"
                        type="text"
                        placeholder="e.g. month, year"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <label for="plan-desc" class="text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    id="plan-desc"
                    v-model="localPlan.description"
                    rows="2"
                    placeholder="Description"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label for="plan-storage" class="text-sm font-medium text-gray-700">Storage Limit (bytes)</label>
                    <input 
                        id="plan-storage"
                        v-model="localPlan.storage_limit"
                        type="number"
                        placeholder="Storage limit"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="plan-uploads" class="text-sm font-medium text-gray-700">Upload Limit (per day)</label>
                    <input 
                        id="plan-uploads"
                        v-model="localPlan.upload_limit"
                        type="number"
                        placeholder="Upload limit"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="plan-duration" class="text-sm font-medium text-gray-700">Duration Limit (sec)</label>
                    <input 
                        id="plan-duration"
                        v-model="localPlan.duration_limit"
                        type="number"
                        placeholder="Duration limit"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="plan-active" 
                    v-model="localPlan.is_active"
                    class="w-4 h-4 rounded border-gray-300"
                />
                <label for="plan-active" class="text-sm font-medium text-gray-700">Active</label>
            </div>
        </div>

        <template #footer>
            <Button variant="secondary" label="Cancel" @click="visibleModel = false" />
            <Button label="Save Changes" @click="onSave" :loading="loading" />
        </template>
    </Dialog>
</template>
