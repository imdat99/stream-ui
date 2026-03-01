<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import CheckIcon from '@/components/icons/CheckIcon.vue';

const props = defineProps<{
    plans: ModelPlan[];
    isLoading: boolean;
    currentPlanId?: string;
    subscribingPlanId?: string | null;
}>();

const emit = defineEmits<{
    (e: 'subscribe', plan: ModelPlan): void;
}>();

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 mins';
    return `${Math.floor(seconds / 60)} mins`;
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Available Plans</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Choose the plan that best fits your needs.
            </p>
        </div>
        <div class="p-6">
            <!-- Loading State -->
            <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="i in 3" :key="i">
                    <div class="h-[200px] rounded-lg bg-muted/50 animate-pulse"></div>
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    v-for="plan in plans"
                    :key="plan.id"
                    class="border border-border rounded-lg p-4 hover:bg-muted/30 transition-all"
                >
                    <div class="mb-3">
                        <h3 class="text-lg font-semibold text-foreground">{{ plan.name }}</h3>
                        <p class="text-sm text-foreground/60 mt-1 min-h-[2.5rem]">{{ plan.description }}</p>
                    </div>

                    <div class="mb-4">
                        <span class="text-2xl font-bold text-foreground">${{ plan.price }}</span>
                        <span class="text-foreground/60 text-sm">/{{ plan.cycle }}</span>
                    </div>

                    <ul class="space-y-2 mb-4 text-sm">
                        <li class="flex items-center gap-2 text-foreground/70">
                            <CheckIcon class="w-4 h-4 text-success shrink-0" />
                            {{ formatBytes(plan.storage_limit || 0) }} Storage
                        </li>
                        <li class="flex items-center gap-2 text-foreground/70">
                            <CheckIcon class="w-4 h-4 text-success shrink-0" />
                            {{ formatDuration(plan.duration_limit) }} Max Duration
                        </li>
                        <li class="flex items-center gap-2 text-foreground/70">
                            <CheckIcon class="w-4 h-4 text-success shrink-0" />
                            {{ plan.upload_limit }} Uploads / day
                        </li>
                    </ul>

                    <button
                        :disabled="!!subscribingPlanId || plan.id === currentPlanId"
                        :class="[
                            'w-full py-2 px-4 rounded-md text-sm font-medium transition-all',
                            plan.id === currentPlanId
                                ? 'bg-muted/50 text-foreground/60 cursor-not-allowed'
                                : subscribingPlanId === plan.id
                                    ? 'bg-muted/50 text-foreground/60 cursor-wait'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        ]"
                        @click="emit('subscribe', plan)"
                    >
                        {{ plan.id === currentPlanId ? 'Current Plan' : (subscribingPlanId === plan.id ? 'Processing...' : 'Upgrade') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
