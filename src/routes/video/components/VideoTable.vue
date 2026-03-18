<script setup lang="ts">
import BaseTable from '@/components/ui/BaseTable.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import { formatBytes, formatDate, getStatusSeverity } from '@/lib/utils';
import type { Video as ModelVideo } from '@/server/gen/proto/app/v1/common';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
  videos: ModelVideo[];
  selectedVideos: ModelVideo[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selectedVideos', value: ModelVideo[]): void;
  (e: 'delete', videoId: string): void;
  (e: 'edit', videoId: string): void;
  (e: 'copy', videoId: string): void;
}>();

const { t } = useTranslation();

const severityClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  secondary: 'bg-gray-100 text-gray-800',
};

const isAllSelected = computed(() =>
  props.videos.length > 0 && props.selectedVideos.length === props.videos.length
);

const toggleAll = () => {
  if (isAllSelected.value) {
    emit('update:selectedVideos', []);
    return;
  }

  emit('update:selectedVideos', [...props.videos]);
};

const toggleRow = (video: ModelVideo) => {
  const exists = props.selectedVideos.some(v => v.id === video.id);
  if (exists) {
    emit('update:selectedVideos', props.selectedVideos.filter(v => v.id !== video.id));
    return;
  }

  emit('update:selectedVideos', [...props.selectedVideos, video]);
};

const isSelected = (video: ModelVideo) =>
  props.selectedVideos.some(v => v.id === video.id);

const columns = computed<ColumnDef<ModelVideo>[]>(() => [
  {
    id: 'select',
    header: () => h('input', {
      type: 'checkbox',
      checked: isAllSelected.value,
      onChange: toggleAll,
      class: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
    }),
    cell: ({ row }) => h('input', {
      type: 'checkbox',
      checked: isSelected(row.original),
      onChange: () => toggleRow(row.original),
      class: 'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
    }),
    enableSorting: false,
    meta: {
      headerClass: 'w-12',
    },
  },
  {
    id: 'video',
    header: t('video.table.video'),
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-200' }, row.original.thumbnail
        ? h('img', {
          src: row.original.thumbnail,
          alt: row.original.title,
          class: 'h-full w-full object-cover',
        })
        : h('div', { class: 'flex h-full w-full items-center justify-center' }, [
          h(VideoIcon, { class: 'h-5 w-5 text-gray-400' }),
        ])),
      h('div', { class: 'min-w-0 flex-1' }, [
        h('p', { class: 'truncate font-medium text-gray-900' }, row.original.title),
        h('p', { class: 'truncate text-sm text-gray-500' }, row.original.description || t('video.table.noDescription')),
      ]),
    ]),
  },
  {
    accessorKey: 'status',
    header: t('video.table.status'),
    cell: ({ row }) => h('span', {
      class: [
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        severityClasses[getStatusSeverity(row.original.status) || 'secondary'],
      ],
    }, row.original.status),
  },
  {
    id: 'size',
    header: t('video.table.size'),
    accessorFn: row => Number(row.size || 0),
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatBytes(row.original.size)),
  },
  {
    id: 'createdAt',
    header: t('video.table.created'),
    accessorFn: row => row.createdAt || '',
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatDate(row.original.createdAt, true)),
  },
  {
    id: 'actions',
    header: t('video.table.actions'),
    enableSorting: false,
    cell: ({ row }) => h('div', { class: 'flex items-center gap-0.5' }, [
      h('button', {
        class: 'rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700',
        title: t('video.table.copyLink'),
        onClick: () => emit('copy', row.original.id!),
      }, [h(LinkIcon, { class: 'h-4 w-4' })]),
      h('button', {
        class: 'rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary',
        title: t('video.table.edit'),
        onClick: () => emit('edit', row.original.id!),
      }, [h(PencilIcon, { class: 'h-4 w-4' })]),
      h('button', {
        class: 'rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500',
        title: t('video.table.delete'),
        onClick: () => emit('delete', row.original.id!),
      }, [h(TrashIcon, { class: 'h-4 w-4' })]),
    ]),
  },
]);
</script>

<template>
  <BaseTable
    :data="videos"
    :columns="columns"
    :loading="loading"
    :get-row-id="(row, index) => row.id || `${row.title || 'video'}-${index}`"
    tableClass="min-w-[50rem]"
    :body-row-class="(row) => isSelected(row.original) ? 'bg-primary/5' : ''"
  >
    <template #loading>
      <div class="divide-y divide-gray-200">
        <div v-for="i in 10" :key="i" class="p-4">
          <div class="flex items-center gap-4">
            <div class="h-12 w-20 rounded-md bg-gray-200 animate-pulse" />
            <div class="flex-1">
              <div class="mb-2 h-4 w-2/5 rounded bg-gray-200 animate-pulse" />
              <div class="h-3 w-1/4 rounded bg-gray-200 animate-pulse" />
            </div>
            <div class="h-3 w-[8%] rounded bg-gray-200 animate-pulse" />
            <div class="h-3 w-[8%] rounded bg-gray-200 animate-pulse" />
            <div class="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
            <div class="h-7 w-22 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </template>
  </BaseTable>
</template>
