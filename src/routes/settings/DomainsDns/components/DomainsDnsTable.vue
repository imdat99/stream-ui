<script setup lang="ts">
import LinkIcon from '@/components/icons/LinkIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import BaseTable from '@/components/ui/BaseTable.vue';
import { formatDate } from '@/lib/utils';
import SettingsTableSkeleton from '@/routes/settings/components/SettingsTableSkeleton.vue';
import type { Domain } from '@/server/api/proto/app/v1/common';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';
import { computed, h } from 'vue';

const props = defineProps<{
  domains: Domain[];
  isInitialLoading: boolean;
  adding: boolean;
  removingId: string | null;
}>();

const emit = defineEmits<{
  (e: 'remove', domain: Domain): void;
}>();

const { t } = useTranslation();

const columns = computed<ColumnDef<Domain>[]>(() => [
  {
    id: 'domain',
    header: t('settings.domainsDns.table.domain'),
    cell: ({ row, getValue }) => h('div', { class: 'flex items-center gap-2' }, [
      h(LinkIcon, { class: 'h-4 w-4 text-foreground/40' }),
      h('span', { class: 'text-sm font-medium text-foreground' }, row.original.name),
    ]),
    meta: {
      headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
      cellClass: 'px-6 py-3',
    },
  },
  {
    id: 'addedAt',
    header: t('settings.domainsDns.table.addedDate'),
    accessorFn: row => formatDate(row.createdAt),
    cell: ({ getValue }) => h('span', { class: 'text-sm text-foreground/60' }, getValue<string>()),
    meta: {
      headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
      cellClass: 'px-6 py-3',
    },
  },
  {
    id: 'actions',
    header: t('common.actions'),
    enableSorting: false,
    cell: ({ row }) => h(AppButton, {
      variant: 'ghost',
      size: 'sm',
      disabled: props.adding || props.removingId !== null,
      onClick: () => emit('remove', row.original),
    }, {
      icon: () => h(TrashIcon, { class: 'h-4 w-4 text-danger' }),
    }),
    meta: { headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50 [&>div]:justify-center', cellClass: 'px-6 py-3 text-center' },
  },
]);
</script>

<template>

  <BaseTable
    :data="domains"
    :columns="columns"
    :loading="isInitialLoading"
    :skeleton-rows="4"
    :get-row-id="(row) => row.id!"
    wrapperClass="mt-4 border-b border-border rounded-none border-x-0 border-t-0 bg-transparent"
    tableClass="w-full"
    headerRowClass="bg-muted/30"
    bodyRowClass="border-b border-border hover:bg-muted/30"
  >
    <template #empty>
      <div class="px-6 py-12 text-center">
        <LinkIcon class="mx-auto mb-3 block h-10 w-10 text-foreground/30" />
        <p class="mb-1 text-sm text-foreground/60">{{ t('settings.domainsDns.emptyTitle') }}</p>
        <p class="text-xs text-foreground/40">{{ t('settings.domainsDns.emptySubtitle') }}</p>
      </div>
    </template>
  </BaseTable>
</template>
