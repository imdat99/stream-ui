<script setup lang="ts">
import { type ModelPlan } from '@/api/client';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';

defineProps<{
    currentPlan?: ModelPlan;
}>();

defineEmits<{
    (e: 'manage'): void;
}>();
</script>

<template>
    <div class="bg-surface border border-border rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Current Plan</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Your current subscription and billing information.
            </p>
        </div>
        <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <CreditCardIcon class="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">{{ currentPlan?.name || 'Standard Plan' }}</h3>
                        <p class="text-sm text-foreground/60">${{ currentPlan?.price || 0 }}/month</p>
                    </div>
                </div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                    Active
                </span>
            </div>
        </div>
    </div>
</template>
