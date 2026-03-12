<script setup lang="ts">
import PageHeader from "@/components/dashboard/PageHeader.vue";

defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <section class="space-y-4">
    <PageHeader :title="title" :description="description" />

    <div class="rounded-2xl border border-gray-200 bg-white p-6">
      <slot />
    </div>
  </section>
</template>
