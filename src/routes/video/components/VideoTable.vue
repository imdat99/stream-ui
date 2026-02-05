<script setup lang="ts">
import type { ModelVideo } from '@/api/client'
import { createColumnHelper } from '@/components/table/Column'
import DataTable from '@/components/table/DataTable.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import { formatBytes, formatDate, formatDuration, getStatusClass } from '@/lib/utils'
import { h } from 'vue'

interface Props {
  videos: ModelVideo[]
  selectedVideos: ModelVideo[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:selectedVideos', value: ModelVideo[]): void
  (e: 'delete', videoId: string): void
}>()

const columnHelper = createColumnHelper<ModelVideo>()

const isSelected = (video: ModelVideo) => {
  return props.selectedVideos.some(v => v.id === video.id)
}

const toggleAll = () => {
  const allSelected = props.videos.length > 0 && props.videos.every(v => isSelected(v))
  const newSelection = allSelected ? [] : [...props.videos]
  emit('update:selectedVideos', newSelection)
}

const allSelected = () => props.videos.length > 0 && props.videos.every(v => isSelected(v))
const someSelected = () => props.videos.some(v => isSelected(v)) && !allSelected()

const columns = [
  columnHelper.display({
    id: 'select',
    header: () => h('div', {
      class: 'flex justify-center'
    }, h(Checkbox, {
      modelValue: allSelected(),
      binary: true,
      onClick: toggleAll
    })),
    cell: ({ row }) => h('div', {
      class: 'flex justify-center'
    }, h(Checkbox, {
      modelValue: isSelected(row.original),
      binary: true,
      onClick: () => {
        const newSelection = isSelected(row.original)
          ? props.selectedVideos.filter(v => v.id !== row.original.id)
          : [...props.selectedVideos, row.original]
        emit('update:selectedVideos', newSelection)
      }
    })),
    size: 50
  }),
  columnHelper.accessor('title', {
    header: 'Video',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0' }, [
        row.original.thumbnail
          ? h('img', {
              src: row.original.thumbnail,
              alt: row.original.title,
              class: 'w-full h-full object-cover'
            })
          : h('div', { class: 'w-full h-full flex items-center justify-center' }, [
              h('span', { class: 'i-heroicons-film text-gray-400 text-xl' })
            ])
      ]),
      h('div', { class: 'min-w-0 flex-1' }, [
        h('p', { class: 'font-medium text-gray-900 truncate' }, row.original.title),
        h('p', { class: 'text-sm text-gray-500 truncate' }, row.original.description || 'No description')
      ])
    ]),
    enableSorting: true
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() || 'Unknown'
      return h('span', {
        class: `px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusClass(status)}`
      }, status)
    },
    enableSorting: true
  }),
  columnHelper.accessor('duration', {
    header: 'Duration',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, formatDuration(getValue())),
    enableSorting: true
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, formatBytes(getValue())),
    enableSorting: true
  }),
  columnHelper.accessor('created_at', {
    header: 'Upload Date',
    cell: ({ getValue }) => h('span', { class: 'text-sm text-gray-500' }, formatDate(getValue())),
    enableSorting: true
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1' }, [
      h('button', {
        class: 'p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors',
        title: 'Download'
      }, h('span', { class: 'i-heroicons-arrow-down-tray w-4 h-4' })),
      h('button', {
        class: 'p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded transition-colors',
        title: 'Copy Link'
      }, h('span', { class: 'i-heroicons-link w-4 h-4' })),
      h('div', { class: 'w-px h-3 bg-gray-200 mx-1' }),
      h('button', {
        class: 'p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors',
        title: 'Edit'
      }, h('span', { class: 'i-heroicons-pencil w-4 h-4' })),
      h('button', {
        class: 'p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors',
        title: 'Delete',
        onClick: () => row.original.id && emit('delete', row.original.id)
      }, h('span', { class: 'i-heroicons-trash w-4 h-4' }))
    ]),
    size: 150
  })
]
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <DataTable
      :data="videos"
      :columns="columns"
      :enable-sorting="true"
    />
  </div>
</template>
