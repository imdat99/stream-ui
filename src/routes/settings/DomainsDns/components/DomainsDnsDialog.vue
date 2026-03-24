<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppInput from '@/components/ui/AppInput.vue';
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
  visible: boolean;
  domain: string;
  adding: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'update:domain', value: string): void;
  (e: 'submit'): void;
  (e: 'close'): void;
}>();

const { t } = useTranslation();
</script>

<template>
  <AppDialog
    :visible="visible"
    :title="t('settings.domainsDns.dialog.title')"
    maxWidthClass="max-w-md"
    @update:visible="emit('update:visible', $event)"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div class="grid gap-2">
        <label for="domain" class="text-sm font-medium text-foreground">{{ t('settings.domainsDns.dialog.domainLabel') }}</label>
        <AppInput
          id="domain"
          :model-value="domain"
          :placeholder="t('settings.domainsDns.dialog.domainPlaceholder')"
          @update:model-value="emit('update:domain', String($event ?? ''))"
          @enter="emit('submit')"
        />
        <p class="text-xs text-foreground/50">{{ t('settings.domainsDns.dialog.domainHint') }}</p>
      </div>

      <SettingsNotice
        tone="warning"
        :title="t('settings.domainsDns.dialog.importantTitle')"
        class="p-3"
      >
        <p>{{ t('settings.domainsDns.dialog.importantDetail') }}</p>
      </SettingsNotice>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="adding" @click="emit('close')">
          {{ t('common.cancel') }}
        </AppButton>
        <AppButton size="sm" :loading="adding" @click="emit('submit')">
          <template #icon>
            <CheckIcon class="w-4 h-4" />
          </template>
          {{ t('settings.domainsDns.addDomain') }}
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>
