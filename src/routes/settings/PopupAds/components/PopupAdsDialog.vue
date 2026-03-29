<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import AppSwitch from '@/components/ui/AppSwitch.vue';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import type { PopupAdFormData, PopupAdItem } from '../types';

const props = defineProps<{
  visible: boolean;
  editingItem: PopupAdItem | null;
  formData: PopupAdFormData;
  saving: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'update:formData', value: PopupAdFormData): void;
  (e: 'save'): void;
  (e: 'close'): void;
}>();

const { t } = useTranslation();

const title = computed(() => props.editingItem
  ? t('settings.popupAds.dialog.editTitle')
  : t('settings.popupAds.dialog.createTitle'));

const updateForm = (patch: Partial<PopupAdFormData>) => {
  emit('update:formData', {
    ...props.formData,
    ...patch,
  });
};

const updateTextField = (key: 'label' | 'value', value: string | number | null) => {
  updateForm({
    [key]: typeof value === 'string' ? value : value == null ? '' : String(value),
  } as Partial<PopupAdFormData>);
};

const updateNumberField = (value: string | number | null) => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  updateForm({ maxTriggersPerSession: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
};
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
        <label for="popup-ad-type" class="text-sm font-medium text-foreground">{{ t('settings.popupAds.dialog.type') }}</label>
        <AppInput
          id="popup-ad-type"
          as="select"
          :model-value="formData.type"
          @update:model-value="updateForm({ type: ($event as 'url' | 'script') || 'url' })"
        >
          <option value="url">{{ t('settings.popupAds.types.url') }}</option>
          <option value="script">{{ t('settings.popupAds.types.script') }}</option>
        </AppInput>
      </div>

      <div class="grid gap-2">
        <label for="popup-ad-label" class="text-sm font-medium text-foreground">{{ t('settings.popupAds.dialog.label') }}</label>
        <AppInput
          id="popup-ad-label"
          :model-value="formData.label"
          :placeholder="t('settings.popupAds.dialog.labelPlaceholder')"
          @update:model-value="updateTextField('label', $event)"
        />
      </div>

      <div class="grid gap-2">
        <label for="popup-ad-value" class="text-sm font-medium text-foreground">{{ t(formData.type === 'url' ? 'settings.popupAds.dialog.url' : 'settings.popupAds.dialog.script') }}</label>
        <AppInput
          v-if="formData.type === 'url'"
          id="popup-ad-value"
          :model-value="formData.value"
          :placeholder="t('settings.popupAds.dialog.urlPlaceholder')"
          @update:model-value="updateTextField('value', $event)"
        />
        <AppInput
          v-else
          id="popup-ad-value"
          as="textarea"
          :rows="5"
          :model-value="formData.value"
          :placeholder="t('settings.popupAds.dialog.scriptPlaceholder')"
          inputClass="resize-y font-mono text-sm"
          @update:model-value="updateTextField('value', $event)"
        />
      </div>

      <div v-if="formData.type === 'url'" class="grid gap-2">
        <label for="popup-ad-max-triggers" class="text-sm font-medium text-foreground">{{ t('settings.popupAds.dialog.maxTriggersPerSession') }}</label>
        <AppInput
          id="popup-ad-max-triggers"
          type="number"
          min="1"
          :model-value="formData.maxTriggersPerSession"
          @update:model-value="updateNumberField($event)"
        />
      </div>

      <div class="flex items-center justify-between rounded-md border border-border bg-header/40 px-3 py-3">
        <div>
          <p class="text-sm font-medium text-foreground">{{ t('settings.popupAds.dialog.activeTitle') }}</p>
          <p class="mt-0.5 text-xs text-foreground/60">{{ t('settings.popupAds.dialog.activeDescription') }}</p>
        </div>
        <AppSwitch :model-value="formData.isActive" @update:model-value="updateForm({ isActive: $event })" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="saving" @click="emit('close')">
          {{ t('common.cancel') }}
        </AppButton>
        <AppButton size="sm" :loading="saving" @click="emit('save')">
          <template #icon>
            <CheckIcon class="h-4 w-4" />
          </template>
          {{ editingItem ? t('settings.popupAds.dialog.update') : t('settings.popupAds.dialog.create') }}
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>
