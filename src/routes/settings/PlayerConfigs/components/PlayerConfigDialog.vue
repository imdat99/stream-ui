<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import type { PlayerConfigFormData } from '../types';

type FormBooleanKey =
    | 'autoplay'
    | 'loop'
    | 'muted'
    | 'showControls'
    | 'pip'
    | 'airplay'
    | 'chromecast'
    | 'encrytionM3u8'
    | 'isDefault';

const props = defineProps<{
    visible: boolean;
    editingConfig: { isActive: boolean } | null;
    formData: PlayerConfigFormData;
    saving: boolean;
    canEditDialog: boolean;
    canSubmit: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:formData', value: PlayerConfigFormData): void;
    (e: 'save'): void;
    (e: 'close'): void;
}>();

const { t } = useTranslation();

const title = computed(() => props.editingConfig
    ? t('settings.playerConfigs.dialog.editTitle')
    : t('settings.playerConfigs.dialog.createTitle'));

const canToggleDefault = computed(() => props.canEditDialog && (!props.editingConfig || props.editingConfig.isActive));

const defaultHint = computed(() => props.editingConfig && !props.editingConfig.isActive
    ? t('settings.playerConfigs.dialog.defaultDisabledHint')
    : t('settings.playerConfigs.dialog.defaultHint'));

const updateTextField = (key: 'name' | 'description' | 'logoUrl', value: string | number | null) => {
    emit('update:formData', {
        ...props.formData,
        [key]: typeof value === 'string' ? value : value == null ? '' : String(value),
    });
};

const updateCheckboxField = (key: FormBooleanKey, event: Event) => {
    emit('update:formData', {
        ...props.formData,
        [key]: (event.target as HTMLInputElement).checked,
    });
};

const optionCardClass = (disabled: boolean) => [
    'flex items-start gap-3 rounded-md border border-border p-3 transition-colors',
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary/50',
];
</script>

<template>
    <AppDialog
        :visible="visible"
        :title="title"
        maxWidthClass="max-w-2xl"
        @update:visible="emit('update:visible', $event)"
        @close="emit('close')"
    >
        <div class="space-y-4">
            <div class="grid gap-2">
                <label for="name" class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.name') }}</label>
                <AppInput
                    id="name"
                    :model-value="formData.name"
                    :disabled="!canEditDialog"
                    :placeholder="t('settings.playerConfigs.dialog.namePlaceholder')"
                    @update:model-value="updateTextField('name', $event)"
                />
            </div>

            <div class="grid gap-2">
                <label for="description" class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.description') }}</label>
                <AppInput
                    id="description"
                    :model-value="formData.description"
                    :disabled="!canEditDialog"
                    :placeholder="t('settings.playerConfigs.dialog.descriptionPlaceholder')"
                    @update:model-value="updateTextField('description', $event)"
                />
            </div>

            <div class="grid gap-3">
                <label class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.playbackOptions') }}</label>

                <div class="grid grid-cols-2 gap-3">
                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.autoplay"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('autoplay', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.autoplay.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.autoplay.description') }}</p>
                        </div>
                    </label>

                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.loop"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('loop', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.loop.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.loop.description') }}</p>
                        </div>
                    </label>

                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.muted"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('muted', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.muted.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.muted.description') }}</p>
                        </div>
                    </label>

                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.showControls"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('showControls', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.showControls.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.showControls.description') }}</p>
                        </div>
                    </label>
                </div>
            </div>

            <div class="grid gap-3">
                <label class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.castingOptions') }}</label>

                <div class="grid grid-cols-3 gap-3">
                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.pip"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('pip', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.pip.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.pip.description') }}</p>
                        </div>
                    </label>

                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.airplay"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('airplay', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.airplay.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.airplay.description') }}</p>
                        </div>
                    </label>

                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.chromecast"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('chromecast', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.chromecast.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.chromecast.description') }}</p>
                        </div>
                    </label>
                </div>
            </div>

            <div class="grid gap-3">
                <label class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.advancedOptions') }}</label>

                <div class="grid grid-cols-1 gap-3">
                    <label :class="optionCardClass(!canEditDialog)">
                        <input
                            :checked="formData.encrytionM3u8"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canEditDialog"
                            @change="updateCheckboxField('encrytionM3u8', $event)"
                        />
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.items.encrytionM3u8.title') }}</p>
                            <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.items.encrytionM3u8.description') }}</p>
                        </div>
                    </label>

                    <div class="grid gap-2 rounded-md border border-border p-3">
                        <label for="logoUrl" class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.logoUrl') }}</label>
                        <AppInput
                            id="logoUrl"
                            :model-value="formData.logoUrl"
                            :disabled="!canEditDialog"
                            :placeholder="t('settings.playerConfigs.dialog.logoUrlPlaceholder')"
                            @update:model-value="updateTextField('logoUrl', $event)"
                        />
                        <p class="text-xs text-foreground/60">{{ t('settings.playerConfigs.dialog.logoUrlHint') }}</p>
                    </div>
                </div>
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium text-foreground">{{ t('settings.playerConfigs.dialog.defaultLabel') }}</label>
                <label
                    :class="[
                        'flex items-start gap-3 rounded-md border border-border p-3',
                        canToggleDefault && !saving ? 'cursor-pointer hover:border-primary/50' : 'opacity-60 cursor-not-allowed',
                    ]"
                >
                    <input
                        :checked="formData.isDefault"
                        type="checkbox"
                        class="mt-1 h-4 w-4 rounded border-border"
                        :disabled="!canToggleDefault || saving"
                        @change="updateCheckboxField('isDefault', $event)"
                    />
                    <div>
                        <p class="text-sm text-foreground">{{ t('settings.playerConfigs.dialog.defaultCheckbox') }}</p>
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
                <AppButton size="sm" :loading="saving" :disabled="!canSubmit" @click="emit('save')">
                    <template #icon>
                        <CheckIcon class="h-4 w-4" />
                    </template>
                    {{ editingConfig ? t('settings.playerConfigs.dialog.update') : t('settings.playerConfigs.dialog.create') }}
                </AppButton>
            </div>
        </template>
    </AppDialog>
</template>
