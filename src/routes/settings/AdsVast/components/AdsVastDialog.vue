<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import type { AdTemplate, CreateAdTemplateRequest } from '../types';

const AD_FORMAT_OPTIONS = ['pre-roll', 'mid-roll', 'post-roll'] as const;

type AdFormatOption = NonNullable<CreateAdTemplateRequest['adFormat']>;

const props = defineProps<{
    visible: boolean;
    editingTemplate: AdTemplate | null;
    formData: CreateAdTemplateRequest;
    saving: boolean;
    canEdit: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:formData', value: CreateAdTemplateRequest): void;
    (e: 'save'): void;
    (e: 'close'): void;
}>();

const { t } = useTranslation();

const title = computed(() => props.editingTemplate
    ? t('settings.adsVast.dialog.editTitle')
    : t('settings.adsVast.dialog.createTitle'));

const canToggleDefault = computed(() => props.canEdit && (!props.editingTemplate || Boolean(props.editingTemplate.isActive)));

const defaultHint = computed(() => props.editingTemplate && !Boolean(props.editingTemplate.isActive)
    ? t('settings.adsVast.dialog.defaultDisabledHint')
    : t('settings.adsVast.dialog.defaultHint'));

const adFormatLabels = computed<Record<string, string>>(() => ({
    'pre-roll': t('settings.adsVast.formats.preRoll'),
    'mid-roll': t('settings.adsVast.formats.midRoll'),
    'post-roll': t('settings.adsVast.formats.postRoll'),
}));

const updateForm = (patch: Partial<CreateAdTemplateRequest>) => {
    emit('update:formData', {
        ...props.formData,
        ...patch,
    });
};

const updateTextField = (key: 'name' | 'vastTagUrl', value: string | number | null) => {
    updateForm({
        [key]: typeof value === 'string' ? value : value == null ? '' : String(value),
    });
};

const updateDuration = (value: string | number | null) => {
    if (typeof value === 'number') {
        updateForm({ duration: value });
        return;
    }

    if (value == null || value === '') {
        updateForm({ duration: undefined });
        return;
    }

    const parsed = Number(value);
    updateForm({ duration: Number.isNaN(parsed) ? undefined : parsed });
};

const updateCheckbox = (event: Event) => {
    updateForm({
        isDefault: (event.target as HTMLInputElement).checked,
    });
};

const selectAdFormat = (format: AdFormatOption) => {
    updateForm({
        adFormat: format,
        duration: format === 'mid-roll' ? props.formData.duration : undefined,
    });
};

const formatButtonClass = (format: AdFormatOption) => [
    'px-3 py-2 border rounded-md text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed',
    props.formData.adFormat === format
        ? 'border-primary bg-primary/5 text-primary'
        : 'border-border text-foreground/60 hover:border-primary/50',
];
</script>

<template>
    <AppDialog
        :visible="visible"
        :title="title"
        maxWidthClass="max-w-lg"
        @update:visible="emit('update:visible', $event)"
        @close="emit('close')"
    >
        <div class="space-y-4">
            <div class="grid gap-2">
                <label for="name" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.templateName') }}</label>
                <AppInput
                    id="name"
                    :model-value="formData.name"
                    :disabled="!canEdit"
                    :placeholder="t('settings.adsVast.dialog.templateNamePlaceholder')"
                    @update:model-value="updateTextField('name', $event)"
                />
            </div>

            <div class="grid gap-2">
                <label for="vastUrl" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.vastUrlLabel') }}</label>
                <AppInput
                    id="vastUrl"
                    :model-value="formData.vastTagUrl"
                    :disabled="!canEdit"
                    :placeholder="t('settings.adsVast.dialog.vastUrlPlaceholder')"
                    @update:model-value="updateTextField('vastTagUrl', $event)"
                />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adFormat') }}</label>
                <div class="grid grid-cols-3 gap-2">
                    <button
                        v-for="format in AD_FORMAT_OPTIONS"
                        :key="format"
                        type="button"
                        :disabled="!canEdit"
                        :class="formatButtonClass(format)"
                        @click="selectAdFormat(format)"
                    >
                        {{ adFormatLabels[format] }}
                    </button>
                </div>
            </div>

            <div v-if="formData.adFormat === 'mid-roll'" class="grid gap-2">
                <label for="duration" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adInterval') }}</label>
                <AppInput
                    id="duration"
                    :model-value="formData.duration"
                    :disabled="!canEdit"
                    type="number"
                    :placeholder="t('settings.adsVast.dialog.adIntervalPlaceholder')"
                    :min="10"
                    :max="600"
                    @update:model-value="updateDuration"
                />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.defaultLabel') }}</label>
                <label
                    :class="[
                        'flex items-start gap-3 rounded-md border border-border p-3',
                        canToggleDefault && !saving ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed',
                    ]"
                >
                    <input
                        :checked="Boolean(formData.isDefault)"
                        type="checkbox"
                        class="mt-1 h-4 w-4 rounded border-border"
                        :disabled="!canToggleDefault || saving"
                        @change="updateCheckbox($event)"
                    >
                    <div>
                        <p class="text-sm text-foreground">{{ t('settings.adsVast.dialog.defaultCheckbox') }}</p>
                        <p class="mt-0.5 text-xs text-foreground/60">{{ defaultHint }}</p>
                    </div>
                </label>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <AppButton variant="secondary" size="sm" :disabled="saving" @click="emit('close')">
                    {{ t('common.cancel') }}
                </AppButton>
                <AppButton size="sm" :loading="saving" :disabled="!canEdit" @click="emit('save')">
                    <template #icon>
                        <CheckIcon class="h-4 w-4" />
                    </template>
                    {{ editingTemplate ? t('settings.adsVast.dialog.update') : t('settings.adsVast.dialog.create') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
