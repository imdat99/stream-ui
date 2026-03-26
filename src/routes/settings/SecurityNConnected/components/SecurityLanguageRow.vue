<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue';
import SettingsRow from '@/routes/settings/components/SettingsRow.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    selectedLanguage: string;
    languageOptions: Array<{ value: string; label: string }>;
    languageSaving: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:selectedLanguage', value: string): void;
    (e: 'save'): void;
}>();

const { t } = useTranslation();

const updateSelectedLanguage = (event: Event) => {
    emit('update:selectedLanguage', (event.target as HTMLSelectElement).value);
};
</script>

<template>
    <SettingsRow
        :title="t('settings.securityConnected.language.label')"
        :description="t('settings.securityConnected.language.detail')"
        actionsClass="flex items-center gap-2"
    >
        <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 536"><path d="M269 477c58-131 80-180 128-288 5-12 16-19 29-19s24 7 29 19l128 288c7 16 0 35-16 42s-35 0-42-16l-20-45H347l-20 45c-7 16-26 23-42 16s-23-26-16-42zm107-83h100l-50-113-50 113z" fill="#a6acb9"/><path d="M170 10c18 0 32 14 32 32v32h128c18 0 32 14 32 32s-14 32-32 32h-10l-8 23c-16 45-41 87-72 122 14 9 29 17 44 24l51 22-26 59-51-23c-23-10-45-22-66-36-21 17-44 32-69 44l-35 18c-15 8-35 1-43-15-7-15-1-35 15-43l34-17c17-8 32-18 47-28-14-13-27-27-39-41l-21-24c-11-14-9-34 5-46 13-11 33-9 45 5l20 24c11 14 24 27 37 39 28-31 50-66 64-106v-1H42c-18 0-32-14-32-32s14-32 32-32h96V42c0-18 14-32 32-32z" fill="#1e3050"/></svg>
        </template>

        <template #actions>
            <select
                :value="selectedLanguage"
                :disabled="languageSaving"
                class="rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground disabled:opacity-60"
                @change="updateSelectedLanguage"
            >
                <option
                    v-for="option in languageOptions"
                    :key="option.value"
                    :value="option.value"
                >
                    {{ option.label }}
                </option>
            </select>
            <AppButton
                size="sm"
                variant="secondary"
                :loading="languageSaving"
                :disabled="languageSaving"
                @click="emit('save')"
            >
                {{ t('settings.securityConnected.language.save') }}
            </AppButton>
        </template>
    </SettingsRow>
</template>
