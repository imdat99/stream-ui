<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import CoinsIcon from '@/components/icons/CoinsIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import SettingsRow from '../SettingsRow.vue';

defineProps<{
    title: string;
    description: string;
    buttonLabel: string;
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
            <AppButton size="sm" @click="emit('topup')">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                {{ buttonLabel }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
