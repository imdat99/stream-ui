<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import type { Plan as ModelPlan } from '@/server/gen/proto/app/v1/common';

defineProps<{
    title: string;
    description: string;
    isLoading: boolean;
    plans: ModelPlan[];
    currentPlanId?: string;
    selectingPlanId?: string | null;
    formatMoney: (amount: number) => string;
    getPlanStorageText: (plan: ModelPlan) => string;
    getPlanDurationText: (plan: ModelPlan) => string;
    getPlanUploadsText: (plan: ModelPlan) => string;
    currentPlanLabel: string;
    selectingLabel: string;
    chooseLabel: string;
}>();

const emit = defineEmits<{
    (e: 'select', plan: ModelPlan): void;
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
                v-for="plan in plans.sort((a,b) => (a.price || 0) - (b.price || 0))"
                :key="plan.id"
                :class="[
                    'border rounded-lg p-4 hover:bg-muted/30 transition-all flex flex-col',
                    plan.id === currentPlanId ? 'border-primary/40 bg-primary/5' : 'border-border',
                ]"
            >
                <div class="mb-3">
                    <div class="flex items-center justify-between gap-3">
                        <h3 class="text-lg font-semibold text-foreground">{{ plan.name }}</h3>
                        <span
                            v-if="plan.id === currentPlanId"
                            class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary"
                        >
                            {{ currentPlanLabel }}
                        </span>
                    </div>
                    <p class="text-sm text-foreground/60 mt-1 min-h-[2.5rem]">{{ plan.description }}</p>
                </div>

                <div class="mb-4">
                    <span class="text-2xl font-bold text-foreground">{{ formatMoney(plan.price || 0) }}</span>
                    <span class="text-foreground/60 text-sm"> / {{ $t('settings.billing.cycle.'+plan.cycle) }}</span>
                </div>
                <ul class="space-y-2 mb-4 text-sm">
                    <li
                        v-for="feature in plan.features || []"
                        :key="feature"
                        class="flex items-center gap-2 text-foreground/70"
                    >
                        <CheckIcon class="w-4 h-4 text-success shrink-0" />
                        {{ feature }}
                    </li>
                </ul>

                <button
                    v-if="plan.id !== currentPlanId"
                    :disabled="selectingPlanId === plan.id"
                    :class="[
                        'w-full py-2 px-4 rounded-md text-sm font-medium transition-all mt-a',
                        selectingPlanId === plan.id
                            ? 'bg-muted/50 text-foreground/60 cursor-wait'
                            : 'bg-primary text-white hover:bg-primary/90'
                    ]"
                    @click="emit('select', plan)"
                >
                    {{ selectingPlanId === plan.id ? selectingLabel : chooseLabel }}
                </button>
            </div>
        </div>
    </div>
</template>
