<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import SettingsRow from '../SettingsRow.vue';

defineProps<{
    title: string;
    description: string;
    buttonLabel: string;
    subscriptionTitle?: string;
    subscriptionDescription?: string;
    subscriptionTone?: 'default' | 'warning';
}>();

const emit = defineEmits<{
    (e: 'topup'): void;
}>();
</script>

<template>
    <SettingsRow :title="title" :description="description" iconBoxClass="bg-primary/10">
        <template #icon>
            <CoinsIcon class="w-5 h-5 text-primary" />
        </template>

        <template #actions>
            <div class="flex flex-col items-end gap-2">
                <!-- <div
                    v-if="subscriptionTitle || subscriptionDescription"
                    class="rounded-md border px-3 py-2 text-right"
                    :class="subscriptionTone === 'warning'
                        ? 'border-warning/30 bg-warning/10 text-warning'
                        : 'border-border bg-muted/30 text-foreground/70'"
                >
                    <p v-if="subscriptionTitle" class="text-xs font-medium">{{ subscriptionTitle }}</p>
                    <p v-if="subscriptionDescription" class="mt-0.5 text-xs">{{ subscriptionDescription }}</p>
                </div> -->

                <AppButton size="sm" @click="emit('topup')">
                    <template #icon>
                        <PlusIcon class="w-4 h-4" />
                    </template>
                    {{ buttonLabel }}
                </AppButton>
            </div>
        </template>
    </SettingsRow>
</template>
