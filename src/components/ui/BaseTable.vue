<script setup lang="ts" generic="TData extends Record<string, any>">
import { cn } from '@/lib/utils';
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnMeta,
  type Row,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table';
import { ref } from 'vue';

type TableColumnMeta = ColumnMeta<TData, any> & {
  headerClass?: string;
  cellClass?: string;
};

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
});

const sorting = ref<SortingState>([]);

function updateSorting(updaterOrValue: Updater<SortingState>) {
  sorting.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(sorting.value)
    : updaterOrValue;
}

const table = useVueTable<TData>({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getRowId: props.getRowId,
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: updateSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

function resolveBodyRowClass(row: Row<TData>) {
  return typeof props.bodyRowClass === 'function'
    ? props.bodyRowClass(row)
    : props.bodyRowClass;
}
</script>

<template>
  <div :class="cn('overflow-x-auto rounded-xl border border-gray-200 bg-white', wrapperClass)">
    <table :class="cn('w-full min-w-[48rem] border-collapse', tableClass)">
      <thead class="bg-header">
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          :class="cn('border-b border-gray-200', headerRowClass)"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :class="cn(
              'px-4 py-3 text-left text-sm font-medium text-gray-600',
              header.column.getCanSort() && !header.isPlaceholder && 'cursor-pointer select-none',
              (header.column.columnDef.meta as TableColumnMeta | undefined)?.headerClass
            )"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <div class="flex items-center gap-2">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <span
                v-if="header.column.getCanSort()"
                class="text-[10px] uppercase tracking-wide text-gray-400"
              >
                {{ header.column.getIsSorted() === 'asc' ? 'asc' : header.column.getIsSorted() === 'desc' ? 'desc' : '' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="loading">
          <td
            :colspan="columns.length || 1"
            class="px-4 py-10 text-center text-sm text-gray-500"
          >
            <slot name="loading">
              Loading...
            </slot>
          </td>
        </tr>

        <tr v-else-if="!table.getRowModel().rows.length">
          <td
            :colspan="columns.length || 1"
            class="px-4 py-10 text-center text-sm text-gray-500"
          >
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </td>
        </tr>

        <tr
          v-for="row in table.getRowModel().rows"
          v-else
          :key="row.id"
          :class="cn(
            'border-b border-gray-200 transition-colors last:border-b-0 hover:bg-gray-50',
            resolveBodyRowClass(row)
          )"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="cn(
              'px-4 py-3 align-middle',
              (cell.column.columnDef.meta as TableColumnMeta | undefined)?.cellClass
            )"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
