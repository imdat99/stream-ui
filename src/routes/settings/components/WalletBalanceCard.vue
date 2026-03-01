<script setup lang="ts">
import { ref } from 'vue';
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import XIcon from '@/components/icons/XIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';

const props = defineProps<{
    balance: number;
}>();

const emit = defineEmits<{
    (e: 'topup', amount: number): void;
}>();

const topupDialogVisible = ref(false);
const topupAmount = ref<number | null>(null);
const topupLoading = ref(false);

const topupPresets = [10, 20, 50, 100];

const openTopupDialog = () => {
    topupAmount.value = null;
    topupDialogVisible.value = true;
};

const selectPreset = (amount: number) => {
    topupAmount.value = amount;
};

const processTopup = async () => {
    if (!topupAmount.value || topupAmount.value < 1) {
        return;
    }

    topupLoading.value = true;
    try {
        emit('topup', topupAmount.value);
        topupDialogVisible.value = false;
        topupAmount.value = null;
    } finally {
        topupLoading.value = false;
    }
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">Wallet Balance</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    Your current wallet balance for subscriptions and services.
                </p>
            </div>
            <button
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all press-animated"
                @click="openTopupDialog"
            >
                <PlusIcon class="w-4 h-4" />
                Top Up
            </button>
        </div>
        <div class="p-6">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CoinsIcon class="w-8 h-8 text-primary" />
                </div>
                <div>
                    <p class="text-sm text-foreground/60">Current Balance</p>
                    <p class="text-3xl font-bold text-primary">${{ balance.toFixed(2) }}</p>
                </div>
            </div>
        </div>

        <!-- Top-up Dialog -->
        <Teleport to="body">
            <Transition name="dialog">
                <div v-if="topupDialogVisible" class="fixed inset-0 z-50 flex items-center justify-center">
                    <!-- Backdrop -->
                    <div
                        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        @click="topupDialogVisible = false"
                    ></div>

                    <!-- Dialog -->
                    <div
                        class="relative bg-surface border border-border rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
                    >
                        <!-- Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 class="text-lg font-semibold text-foreground">Top Up Wallet</h3>
                            <button
                                class="text-foreground/60 hover:text-foreground transition-colors"
                                @click="topupDialogVisible = false"
                            >
                                <XIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Content -->
                        <div class="p-6 space-y-4">
                            <p class="text-sm text-foreground/70">
                                Select an amount or enter a custom amount to add to your wallet.
                            </p>

                            <!-- Preset Amounts -->
                            <div class="grid grid-cols-4 gap-3">
                                <button
                                    v-for="preset in topupPresets"
                                    :key="preset"
                                    :class="[
                                        'py-2 px-3 rounded-md text-sm font-medium transition-all',
                                        topupAmount === preset
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted/50 text-foreground hover:bg-muted'
                                    ]"
                                    @click="selectPreset(preset)"
                                >
                                    ${{ preset }}
                                </button>
                            </div>

                            <!-- Custom Amount -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium text-foreground">Custom Amount</label>
                                <div class="flex items-center gap-2">
                                    <span class="text-lg font-semibold text-foreground">$</span>
                                    <input
                                        v-model.number="topupAmount"
                                        type="number"
                                        placeholder="Enter amount"
                                        class="flex-1 px-3 py-2 bg-surface border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        min="1"
                                        step="1"
                                    />
                                </div>
                            </div>

                            <!-- Info -->
                            <div class="bg-muted/30 rounded-md p-3 text-xs text-foreground/60">
                                <p>Minimum top-up amount is $1. Funds will be added to your wallet immediately after payment.</p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex justify-end gap-3 px-6 py-4 border-t border-border">
                            <button
                                class="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                                @click="topupDialogVisible = false"
                                :disabled="topupLoading"
                            >
                                Cancel
                            </button>
                            <button
                                class="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                @click="processTopup"
                                :disabled="!topupAmount || topupAmount < 1 || topupLoading"
                            >
                                {{ topupLoading ? 'Processing...' : 'Proceed to Payment' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
    transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
    opacity: 0;
}

.dialog-enter-active .relative,
.dialog-leave-active .relative {
    transition: transform 0.2s ease;
}

.dialog-enter-from .relative,
.dialog-leave-to .relative {
    transform: scale(0.95) translateY(-10px);
}
</style>
