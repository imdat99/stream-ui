<script setup lang="ts">
import type { ModelPlan } from '@/api/client';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';

defineProps<{
    title: string;
    description: string;
    isLoading: boolean;
    plans: ModelPlan[];
    currentPlanId?: string;
    subscribing: string | null;
    formatMoney: (amount: number) => string;
    getPlanStorageText: (plan: ModelPlan) => string;
    getPlanDurationText: (plan: ModelPlan) => string;
    getPlanUploadsText: (plan: ModelPlan) => string;
    currentPlanLabel: string;
    processingLabel: string;
    upgradeLabel: string;
}>();

const emit = defineEmits<{
    (e: 'subscribe', plan: ModelPlan): void;
}>();
</script>

<template>
    <div class="px-6 py-4">
        <div class="flex items-center gap-4 mb-4">
            <div class="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCardIcon class="w-5 h-5 text-primary" />
            </div>
            <div>
                <p class="text-sm font-medium text-foreground">{{ title }}</p>
                <p class="text-xs text-foreground/60 mt-0.5">{{ description }}</p>
            </div>
        </div>

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
                    <span class="text-2xl font-bold text-foreground">{{ formatMoney(plan.price || 0) }}</span>
                    <span class="text-foreground/60 text-sm">/{{ plan.cycle }}</span>
                </div>

                <ul class="space-y-2 mb-4 text-sm">
                    <li class="flex items-center gap-2 text-foreground/70">
                        <CheckIcon class="w-4 h-4 text-success shrink-0" />
                        {{ getPlanStorageText(plan) }}
                    </li>
                    <li class="flex items-center gap-2 text-foreground/70">
                        <CheckIcon class="w-4 h-4 text-success shrink-0" />
                        {{ getPlanDurationText(plan) }}
                    </li>
                    <li class="flex items-center gap-2 text-foreground/70">
                        <CheckIcon class="w-4 h-4 text-success shrink-0" />
                        {{ getPlanUploadsText(plan) }}
                    </li>
                </ul>

                <button
                    :disabled="!!subscribing || plan.id === currentPlanId"
                    :class="[
                        'w-full py-2 px-4 rounded-md text-sm font-medium transition-all',
                        plan.id === currentPlanId
                            ? 'bg-muted/50 text-foreground/60 cursor-not-allowed'
                            : subscribing === plan.id
                                ? 'bg-muted/50 text-foreground/60 cursor-wait'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    ]"
                    @click="emit('subscribe', plan)"
                >
                    {{ plan.id === currentPlanId
                        ? currentPlanLabel
                        : (subscribing === plan.id ? processingLabel : upgradeLabel) }}
                </button>
            </div>
        </div>
    </div>
</template>
