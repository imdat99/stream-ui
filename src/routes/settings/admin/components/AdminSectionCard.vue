<script setup lang="ts">
import { cn } from '@/lib/utils';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';

const props = withDefaults(defineProps<{
  title?: string;
  description?: string;
  bodyClass?: string;
  headerClass?: string;
  titleClass?: string;
  descriptionClass?: string;
}>(), {
  title: '',
  description: '',
  bodyClass: '',
  headerClass: '',
  titleClass: '',
  descriptionClass: '',
});
</script>

<template>
  <SettingsSectionCard
    class="admin-section-card"
    :title="props.title"
    :description="props.description"
    :bodyClass="props.bodyClass === undefined ? 'p-4' : props.bodyClass"
    :headerClass="cn('bg-header', props.headerClass)"
    :titleClass="cn('text-sm font-semibold text-foreground', props.titleClass)"
    :descriptionClass="cn('mt-0.5 text-xs leading-5 text-foreground/60', props.descriptionClass)"
  >
    <template v-if="$slots['header-actions']" #header-actions>
      <slot name="header-actions" />
    </template>

    <slot />
  </SettingsSectionCard>
</template>

<style scoped>
.admin-section-card {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
