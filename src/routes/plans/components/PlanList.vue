<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import { Button, Skeleton } from '@/components/ui/form';
import { formatBytes } from '@/lib/utils';

defineProps<{
    plans: ModelPlan[];
    isLoading: boolean;
    currentPlanId?: string;
    subscribingPlanId?: string | null;
    isAdmin?: boolean;
}>();

const emit = defineEmits<{
    (e: 'subscribe', plan: ModelPlan): void;
    (e: 'edit', plan: ModelPlan): void;
}>();

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 mins';
    return `${Math.floor(seconds / 60)} mins`;
};

const isPopular = (plan: ModelPlan) => {
    return plan.name?.toLowerCase().includes('pro') || plan.name?.toLowerCase().includes('premium');
};

const isCurrentComp = (plan: ModelPlan, currentId?: string) => {
    return plan.id === currentId;
}
</script>

<template>
    <section>
        <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900">Upgrade your workspace</h2>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="i in 3" :key="i" class="h-full">
                <Skeleton height="300px" borderRadius="16px" />
            </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div v-for="plan in plans" :key="plan.id" class="relative group h-full">
                <div v-if="isPopular(plan) && !isCurrentComp(plan, currentPlanId)" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md uppercase tracking-wide">
                    Recommended
                </div>

                <!-- Admin Edit Button -->
                <Button 
                    v-if="isAdmin"
                    class="absolute top-2 right-2 z-20"
                    variant="secondary"
                    @click.stop="emit('edit', plan)"
                />

                <div :class="[
                    'relative bg-white rounded-2xl p-6 h-full border transition-all duration-200 flex flex-col',
                    isCurrentComp(plan, currentPlanId) ? 'border-primary ring-1 ring-primary/50 bg-primary-50/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg',
                    isPopular(plan) && !isCurrentComp(plan, currentPlanId) ? 'shadow-md border-primary/20' : ''
                ]">
                    <div class="mb-4">
                        <h3 class="text-xl font-bold text-gray-900">{{ plan.name }}</h3>
                        <p class="text-gray-500 text-sm min-h-[2.5rem] mt-2">{{ plan.description }}</p>
                    </div>
                    
                    <div class="mb-6">
                        <span class="text-4xl font-bold text-gray-900">${{ plan.price }}</span>
                        <span class="text-gray-500 text-sm">/{{ plan.cycle }}</span>
                    </div>

                    <ul class="space-y-3 mb-8 flex-grow">
                        <li class="flex items-center gap-3 text-sm text-gray-700">
                            <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                            {{ formatBytes(plan.storage_limit || 0) }} Storage
                        </li>
                        <li class="flex items-center gap-3 text-sm text-gray-700">
                            <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                            {{ formatDuration(plan.duration_limit) }} Max Duration
                        </li>
                        <li class="flex items-center gap-3 text-sm text-gray-700">
                            <span class="i-heroicons-check-circle text-green-500 text-lg flex-shrink-0"></span>
                            {{ plan.upload_limit }} Uploads / day
                        </li>
                    </ul>

                    <Button 
                        :label="isCurrentComp(plan, currentPlanId) ? 'Current Plan' : (subscribingPlanId === plan.id ? 'Processing...' : 'Upgrade')" 
                        class="w-full" 
                        :variant="isCurrentComp(plan, currentPlanId) ? 'outlined' : 'primary'"
                        :disabled="!!subscribingPlanId || isCurrentComp(plan, currentPlanId)"
                        @click="emit('subscribe', plan)"
                    />
                </div>
            </div>
        </div>
    </section>
</template>
