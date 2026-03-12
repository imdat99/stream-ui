<script setup lang="ts">
import PageHeader from "@/components/dashboard/PageHeader.vue";

defineProps<{
  title: string;
  description: string;
  eyebrow?: string;
  badge?: string;
}>();
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-5 shadow-[0_18px_60px_-36px_rgba(15,23,42,0.4)]">
      <div class="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0 flex-1">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span v-if="eyebrow" class="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
              {{ eyebrow }}
            </span>
            <span v-if="badge" class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
              {{ badge }}
            </span>
          </div>
          <PageHeader :title="title" :description="description" />
        </div>

        <div v-if="$slots.toolbar" class="flex flex-wrap items-center gap-2 lg:justify-end">
          <slot name="toolbar" />
        </div>
      </div>

      <div v-if="$slots.stats" class="mb-5 grid gap-3 border-b border-slate-200/80 pb-5 md:grid-cols-2 xl:grid-cols-4">
        <slot name="stats" />
      </div>

      <div :class="$slots.aside ? 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]' : ''">
        <div class="min-w-0 rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.45)]">
          <slot />
        </div>
        <aside v-if="$slots.aside" class="min-w-0 rounded-[24px] border border-slate-200/80 bg-slate-950 p-5 text-slate-100 shadow-[0_18px_50px_-30px_rgba(2,6,23,0.8)]">
          <slot name="aside" />
        </aside>
      </div>
    </div>
  </section>
</template>
