<script setup lang="ts" generic="TData extends Record<string, any>">
import AppButton from '@/components/ui/AppButton.vue';
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
import { useTranslation } from 'i18next-vue';
import { computed, ref } from 'vue';

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
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  rowsPerPage?: number;
  pageSizeOptions?: number[];
  canPreviousPage?: boolean;
  canNextPage?: boolean;
  skeletonRows?: number;
}>(), {
  loading: false,
  emptyText: 'No data available.',
  pagination: false,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  rowsPerPage: 10,
  pageSizeOptions: () => [],
  canPreviousPage: false,
  canNextPage: false,
  skeletonRows: 10,
});

const emit = defineEmits<{
  (e: 'previous-page'): void;
  (e: 'next-page'): void;
  (e: 'page-size-change', value: number): void;
}>();

const { t } = useTranslation();
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

const shouldRenderPagination = computed(() => (
  props.pagination
  && !props.loading
  && table.getRowModel().rows.length > 0
));

const skeletonRowIndexes = computed(() =>
  Array.from({ length: Math.max(1, props.skeletonRows) }, (_, index) => index)
);

const skeletonColumnIndexes = computed(() =>
  Array.from({ length: Math.max(1, props.columns.length) }, (_, index) => index)
);

function previousPage() {
  if (!props.canPreviousPage) return;
  emit('previous-page');
}

function nextPage() {
  if (!props.canNextPage) return;
  emit('next-page');
}

function changePageSize(event: Event) {
  const nextValue = Number((event.target as HTMLSelectElement).value) || props.rowsPerPage;
  emit('page-size-change', nextValue);
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
        <template v-if="loading">
          <tr v-if="$slots.loading">
            <td
              :colspan="columns.length || 1"
              class="px-4 py-10 text-center text-sm text-gray-500"
            >
              <slot name="loading" />
            </td>
          </tr>

          <tr
            v-for="rowIndex in skeletonRowIndexes"
            v-else
            :key="`skeleton-row-${rowIndex}`"
            class="border-b border-gray-200 last:border-b-0"
          >
            <td
              v-for="columnIndex in skeletonColumnIndexes"
              :key="`skeleton-cell-${rowIndex}-${columnIndex}`"
              class="px-4 py-3 align-middle"
            >
              <div class="animate-pulse space-y-2">
                <div
                  :class="cn(
                    'h-4 rounded bg-muted/50',
                    columnIndex === skeletonColumnIndexes.length - 1
                      ? 'ml-auto w-16'
                      : 'w-full max-w-[12rem]'
                  )"
                />
                <div
                  v-if="columnIndex === 0"
                  class="h-3 w-24 rounded bg-muted/40"
                />
              </div>
            </td>
          </tr>
        </template>

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

    <div v-if="shouldRenderPagination" class="flex flex-col gap-3 border-t border-gray-200 bg-muted/20 px-6 py-4 text-xs text-foreground/55 sm:flex-row sm:items-center sm:justify-between">
      <div>{{ t('common.page', { current: currentPage, total: totalPages }) }} · {{ totalRecords }} {{ t('common.records') }}</div>
      <div class="flex flex-wrap items-center gap-2">
        <label v-if="pageSizeOptions.length" class="flex items-center gap-2">
          <span>{{ t('common.rowsPerPage') }}</span>
          <select class="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground" :value="String(rowsPerPage)" @change="changePageSize">
            <option v-for="option in pageSizeOptions" :key="option" :value="String(option)">{{ option }}</option>
          </select>
        </label>
        <div class="flex items-center gap-2 xl:justify-end">
          <AppButton size="sm" variant="secondary" :disabled="!canPreviousPage" @click="previousPage">{{ t('common.previous') }}</AppButton>
          <AppButton size="sm" variant="secondary" :disabled="!canNextPage" @click="nextPage">{{ t('common.next') }}</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
