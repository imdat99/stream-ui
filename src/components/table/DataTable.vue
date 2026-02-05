<script setup lang="ts">
import {
    FlexRender,
    getCoreRowModel,
    getSortedRowModel,
    useVueTable,
    type ColumnDef,
    type SortingState
} from '@tanstack/vue-table'
import { ref } from 'vue'

interface Props<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  sorting?: SortingState
  enableSorting?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props<any>>(), {
  sorting: () => [],
  enableSorting: false
})

const emit = defineEmits<{
  'update:sorting': [value: SortingState]
}>()

const sortingState = ref<SortingState>(props.sorting)

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: props.enableSorting ? getSortedRowModel() : undefined,
  onSortingChange: (updater) => {
    if (typeof updater === 'function') {
      sortingState.value = updater(sortingState.value)
    } else {
      sortingState.value = updater
    }
    emit('update:sorting', sortingState.value)
  },
  state: {
    get sorting() {
      return sortingState.value
    }
  }
})
</script>

<template>
  <div :class="['overflow-x-auto', props.class]">
    <table class="w-full text-sm text-left">
      <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="[
              'px-6 py-3 font-medium',
              header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-gray-100' : ''
            ]"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
            <span
              v-if="header.column.getIsSorted()"
              class="ml-1"
            >
              {{ header.column.getIsSorted() === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="hover:bg-gray-50"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="px-6 py-4"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
        <tr v-if="table.getRowModel().rows.length === 0">
          <td
            :colSpan="table.getAllColumns().length"
            class="px-6 py-8 text-center text-gray-500"
          >
            No data available
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
