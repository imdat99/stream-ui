<script setup lang="ts">
import BaseTable from '@/components/ui/BaseTable.vue';
import EmptyState from '@/components/dashboard/EmptyState.vue';
import type { Video as ModelVideo } from '@/server/api/proto/app/v1/common';
import { formatDate, formatDuration } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';
import { useRouter } from 'vue-router';
import { useUIState } from '@/stores/uiState';

interface Props {
  loading: boolean;
  videos: ModelVideo[];
}

const props = defineProps<Props>();

const router = useRouter();
const uiState = useUIState();
const { t } = useTranslation();

const getStatusClass = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'ready': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const columns = computed<ColumnDef<ModelVideo>[]>(() => [
  {
    id: 'video',
    header: t('overview.recentVideos.table.video'),
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'h-12 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-200' }, row.original.thumbnail
        ? h('img', {
          src: row.original.thumbnail,
          alt: row.original.title,
          class: 'h-full w-full object-cover',
        })
        : h('div', { class: 'flex h-full w-full items-center justify-center' }, [
          h('span', { class: 'i-heroicons-film text-xl text-gray-400' }),
        ])),
      h('div', { class: 'min-w-0 flex-1' }, [
        h('p', { class: 'truncate font-medium text-gray-900' }, row.original.title),
        h('p', { class: 'truncate text-sm text-gray-500' }, row.original.description || t('overview.recentVideos.noDescription')),
      ]),
    ]),
    meta: {
      headerClass: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
      cellClass: 'px-6 py-4',
    },
  },
  {
    id: 'status',
    header: t('overview.recentVideos.table.status'),
    accessorFn: row => row.status || '',
    cell: ({ row }) => h('span', {
      class: ['whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium', getStatusClass(row.original.status)],
    }, row.original.status || t('overview.recentVideos.unknownStatus')),
    meta: {
      headerClass: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
      cellClass: 'px-6 py-4',
    },
  },
  {
    id: 'duration',
    header: t('overview.recentVideos.table.duration'),
    accessorFn: row => Number(row.duration || 0),
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatDuration(row.original.duration)),
    meta: {
      headerClass: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
      cellClass: 'px-6 py-4',
    },
  },
  {
    id: 'createdAt',
    header: t('overview.recentVideos.table.uploadDate'),
    accessorFn: row => row.createdAt || '',
    cell: ({ row }) => h('span', { class: 'text-sm text-gray-500' }, formatDate(row.original.createdAt)),
    meta: {
      headerClass: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
      cellClass: 'px-6 py-4',
    },
  },
  {
    id: 'actions',
    header: t('overview.recentVideos.table.actions'),
    enableSorting: false,
    cell: () => h('div', { class: 'flex items-center gap-2' }, [
      h('button', {
        class: 'rounded p-1.5 transition-colors hover:bg-gray-100',
        title: t('overview.recentVideos.actionEdit'),
      }, [h('span', { class: 'i-heroicons-pencil h-4 w-4 text-gray-600' })]),
      h('button', {
        class: 'rounded p-1.5 transition-colors hover:bg-gray-100',
        title: t('overview.recentVideos.actionShare'),
      }, [h('span', { class: 'i-heroicons-share h-4 w-4 text-gray-600' })]),
      h('button', {
        class: 'rounded p-1.5 transition-colors hover:bg-red-100',
        title: t('overview.recentVideos.actionDelete'),
      }, [h('span', { class: 'i-heroicons-trash h-4 w-4 text-red-600' })]),
    ]),
    meta: {
      headerClass: 'px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
      cellClass: 'px-6 py-4',
    },
  },
]);
</script>

<template>
  <div class="mb-8">
    <div v-if="loading">
      <div class="mb-4 flex items-center justify-between">
        <div class="h-6 w-32 rounded bg-gray-200 animate-pulse" />
        <div class="h-4 w-20 rounded bg-gray-200 animate-pulse" />
      </div>
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div v-for="i in 5" :key="i" class="border-b border-gray-200 p-4 last:border-b-0">
          <div class="flex gap-4">
            <div class="h-10 w-16 rounded bg-gray-200 animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-[30%] rounded bg-gray-200 animate-pulse" />
              <div class="h-3 w-[20%] rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ t('overview.recentVideos.title') }}</h2>
        <router-link to="/videos" class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {{ t('overview.recentVideos.viewAll') }}
          <span class="i-heroicons-arrow-right h-4 w-4" />
        </router-link>
      </div>

      <EmptyState
        v-if="videos.length === 0"
        :title="t('overview.recentVideos.emptyTitle')"
        :description="t('overview.recentVideos.emptyDescription')"
        imageUrl="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
        :actionLabel="t('overview.recentVideos.emptyAction')"
        :onAction="() => uiState.toggleUploadDialog()"
      />

      <BaseTable
        v-else
        :data="props.videos"
        :columns="columns"
        :get-row-id="(row, index) => row.id || `recent-video-${index}`"
        wrapperClass="rounded-xl border border-gray-200 bg-white"
        tableClass="w-full"
        headerRowClass="bg-gray-50 border-b border-gray-200"
        bodyRowClass="hover:bg-gray-50"
      />
    </div>
  </div>
</template>
