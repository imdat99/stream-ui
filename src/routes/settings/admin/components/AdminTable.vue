<script setup lang="ts" generic="TData extends Record<string, any>">
import BaseTable from '@/components/ui/BaseTable.vue';
import { cn } from '@/lib/utils';
import type { ColumnDef, Row } from '@tanstack/vue-table';

const props = withDefaults(defineProps<{
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  emptyText?: string;
  tableClass?: string;
  wrapperClass?: string;
  headerRowClass?: string;
  bodyRowClass?: string | ((row: Row<TData>) => string | undefined);
  getRowId?: (originalRow: TData, index: number) => string;
}>(), {
  loading: false,
  emptyText: 'No data available.',
  tableClass: '',
  wrapperClass: '',
  headerRowClass: '',
  bodyRowClass: '',
});

function resolveBodyRowClass(row: Row<TData>) {
  const extra = typeof props.bodyRowClass === 'function'
    ? props.bodyRowClass(row)
    : props.bodyRowClass;

  return cn('border-b border-border hover:bg-header/60', extra);
}
</script>

<template>
  <div class="admin-primer-table">
    <BaseTable
      :data="props.data"
      :columns="props.columns"
      :loading="props.loading"
      :empty-text="props.emptyText"
      :table-class="cn('w-full', props.tableClass)"
      :wrapper-class="cn('border-x-0 border-t-0 rounded-none bg-transparent', props.wrapperClass)"
      :header-row-class="cn('bg-header', props.headerRowClass)"
      :body-row-class="resolveBodyRowClass"
      :get-row-id="props.getRowId"
    >
      <template #loading>
        <slot name="loading">
          Loading...
        </slot>
      </template>

      <template #empty>
        <slot name="empty">
          {{ props.emptyText }}
        </slot>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.admin-primer-table :deep(th) {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.75rem !important;
  line-height: 1rem !important;
  font-weight: 600 !important;
}

.admin-primer-table :deep(td) {
  padding: 0.625rem 0.75rem !important;
}
</style>
