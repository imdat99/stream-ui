<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';

defineProps<{
    visible: boolean;
    presets: number[];
    amount: number | null;
    loading: boolean;
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
        :title="$t('settings.billing.topupDialog.title')"
        maxWidthClass="max-w-md"
    >
        <div class="space-y-4">
            <p class="text-sm text-foreground/70">
                {{ $t('settings.billing.topupDialog.subtitle') }}
            </p>

            <div class="grid grid-cols-4 gap-3">
                <button
                    v-for="preset in presets"
                    :key="preset"
                    :class="[
                        'py-2 px-3 rounded-md bg-header text-sm font-medium transition-all hover:bg-gray-500',
                        amount === preset
                            ? 'bg-primary text-white'
                            : 'bg-muted/50 text-foreground hover:bg-muted'
                    ]"
                    @click="emit('selectPreset', preset)"
                >
                    ${{ preset }}
                </button>
            </div>

            <div class="space-y-2">
                <label class="text-sm font-medium text-foreground">{{ $t('settings.billing.topupDialog.customAmount') }}</label>
                <div class="flex items-center gap-2">
                    <span class="text-lg font-semibold text-foreground">$</span>
                    <AppInput
                        :model-value="amount"
                        type="number"
                        :placeholder="$t('settings.billing.topupDialog.enterAmount')"
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
                <p>{{ $t('settings.billing.topupDialog.hint') }}</p>
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
                    {{ $t('common.cancel') }}
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
                    {{ $t('settings.billing.topupDialog.proceed') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
