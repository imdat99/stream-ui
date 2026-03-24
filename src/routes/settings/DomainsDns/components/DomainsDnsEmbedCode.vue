<script setup lang="ts">
import CheckIcon from '@/components/icons/CheckIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
  code: string;
}>();

const emit = defineEmits<{
  (e: 'copy'): void;
}>();

const { t } = useTranslation();
</script>

<template>
  <div class="px-6 py-4 bg-muted/30">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-sm font-medium text-foreground">{{ t('settings.domainsDns.embedCodeTitle') }}</h4>
      <AppButton variant="secondary" size="sm" @click="emit('copy')">
        <template #icon>
          <CheckIcon class="w-4 h-4" />
        </template>
        {{ t('settings.domainsDns.copyCode') }}
      </AppButton>
    </div>

    <p class="mb-2 text-xs text-foreground/60">
      {{ t('settings.domainsDns.embedCodeHint') }}
    </p>

    <pre class="overflow-x-auto rounded-md border border-border bg-header p-3 text-xs text-foreground/70"><code>{{ code }}</code></pre>
  </div>
</template>
