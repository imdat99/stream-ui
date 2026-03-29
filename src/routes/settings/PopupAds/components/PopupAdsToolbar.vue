<script setup lang="ts">
import PlusIcon from '@/components/icons/PlusIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'create'): void;
}>();

const { t } = useTranslation();
</script>

<template>
  <AppButton size="sm" :disabled="disabled" @click="emit('create')">
    <template #icon>
      <PlusIcon class="h-4 w-4" />
    </template>
    {{ t('settings.popupAds.createItem') }}
  </AppButton>
</template>
