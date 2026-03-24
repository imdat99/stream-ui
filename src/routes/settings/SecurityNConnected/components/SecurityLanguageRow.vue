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
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15 15 0 0 1 0 20" />
                <path d="M12 2a15 15 0 0 0 0 20" />
            </svg>
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
