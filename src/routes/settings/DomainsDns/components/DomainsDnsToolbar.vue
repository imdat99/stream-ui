<script setup lang="ts">
import PlusIcon from '@/components/icons/PlusIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
  disabled: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'create'): void;
}>();

const { t } = useTranslation();
</script>

<template>
  <AppButton size="sm" :loading="loading" :disabled="disabled" @click="emit('create')">
    <template #icon>
      <PlusIcon class="w-4 h-4" />
    </template>
    {{ t('settings.domainsDns.addDomain') }}
  </AppButton>
</template>
