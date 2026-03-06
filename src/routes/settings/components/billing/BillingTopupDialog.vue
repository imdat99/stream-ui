<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';

defineProps<{
    visible: boolean;
    title: string;
    subtitle: string;
    presets: number[];
    amount: number | null;
    loading: boolean;
    customAmountLabel: string;
    amountPlaceholder: string;
    hint: string;
    cancelLabel: string;
    proceedLabel: string;
    formatMoney: (amount: number) => string;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:amount', value: number | null): void;
    (e: 'selectPreset', amount: number): void;
    (e: 'submit'): void;
}>();
</script>

<template>
    <AppDialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :title="title"
        maxWidthClass="max-w-md"
    >
        <div class="space-y-4">
            <p class="text-sm text-foreground/70">
                {{ subtitle }}
            </p>

            <div class="grid grid-cols-4 gap-3">
                <button
                    v-for="preset in presets"
                    :key="preset"
                    :class="[
                        'py-2 px-3 rounded-md text-sm font-medium transition-all',
                        amount === preset
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-foreground hover:bg-muted'
                    ]"
                    @click="emit('selectPreset', preset)"
                >
                    {{ formatMoney(preset) }}
                </button>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">{{ customAmountLabel }}</label>
                <div class="flex items-center gap-2">
                    <span class="text-lg font-semibold text-foreground">$</span>
                    <AppInput
                        :model-value="amount"
                        type="number"
                        :placeholder="amountPlaceholder"
                        inputClass="flex-1"
                        min="1"
                        step="1"
                        @update:model-value="emit('update:amount', typeof $event === 'number' || $event === null
                            ? $event
                            : ($event === '' ? null : Number($event)))"
                    />
                </div>
            </div>

            <div class="bg-muted/30 rounded-md p-3 text-xs text-foreground/60">
                <p>{{ hint }}</p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <AppButton
                    variant="secondary"
                    size="sm"
                    :disabled="loading"
                    @click="emit('update:visible', false)"
                >
                    {{ cancelLabel }}
                </AppButton>
                <AppButton
                    size="sm"
                    :loading="loading"
                    :disabled="!amount || amount < 1 || loading"
                    @click="emit('submit')"
                >
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ proceedLabel }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
