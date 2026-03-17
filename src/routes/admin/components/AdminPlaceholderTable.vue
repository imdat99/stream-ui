<script setup lang="ts">
import BaseTable from '@/components/ui/table/BaseTable.vue';
import type { ColumnDef } from '@tanstack/vue-table';
import { computed, h } from 'vue';

const props = withDefaults(defineProps<{
  columns?: number | string[];
  rows?: number;
}>(), {
  columns: 3,
  rows: 4,
});

type SkeletonRow = { id: string };

const data = computed<SkeletonRow[]>(() =>
  Array.from({ length: props.rows }, (_, index) => ({ id: `placeholder-${index}` }))
);

const columnCount = computed(() => Array.isArray(props.columns) ? props.columns.length : props.columns);

const tableColumns = computed<ColumnDef<SkeletonRow>[]>(() =>
  Array.from({ length: columnCount.value }, (_, index) => ({
    id: `column-${index + 1}`,
    header: () => h('div', { class: 'h-3 w-20 rounded bg-muted/50 animate-pulse' }),
    cell: () => h('div', { class: 'space-y-2' }, [
      h('div', {
        class: [
          'h-4 rounded bg-muted/50',
          index + 1 === columnCount.value ? 'ml-auto w-16' : 'w-full max-w-[12rem]',
        ],
      }),
      index === 0 ? h('div', { class: 'h-3 w-24 rounded bg-muted/40' }) : null,
    ]),
    enableSorting: false,
    meta: {
      headerClass: 'px-4 py-3',
      cellClass: 'px-4 py-4',
    },
  }))
);
</script>

<template>
  <BaseTable
    :data="data"
    :columns="tableColumns"
    wrapperClass="border-0 rounded-none bg-transparent"
    tableClass="w-full"
    headerRowClass="bg-muted/30"
    bodyRowClass="animate-pulse border-b border-border hover:bg-transparent"
  />
</template>
