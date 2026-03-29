import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppSwitch from '@/components/ui/AppSwitch.vue';
import BaseTable from '@/components/ui/BaseTable.vue';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';
import { computed, defineComponent, type PropType } from 'vue';
import type { PopupAdItem } from '../types';

export default defineComponent({
  name: 'PopupAdsTable',
  props: {
    items: { type: Array as PropType<PopupAdItem[]>, required: true },
    disabled: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    currentPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    totalRecords: { type: Number, default: 0 },
    rowsPerPage: { type: Number, default: 10 },
    pageSizeOptions: { type: Array as PropType<number[]>, default: () => [] },
    canPreviousPage: { type: Boolean, default: false },
    canNextPage: { type: Boolean, default: false },
  },
  emits: {
    edit: (item: PopupAdItem) => true,
    delete: (item: PopupAdItem) => true,
    'toggle-active': (payload: { item: PopupAdItem; value: boolean }) => true,
    'previous-page': () => true,
    'next-page': () => true,
    'page-size-change': (value: number) => true,
  },
  setup(props, { emit }) {
    const { t } = useTranslation();

    const columns = computed<ColumnDef<PopupAdItem>[]>(() => [
      {
        id: 'label',
        header: t('settings.popupAds.table.label'),
        accessorFn: (row) => row.label || '',
        cell: ({ row }) => (
          <div>
            <p class="text-sm font-medium text-foreground">{row.original.label}</p>
            <p class="mt-0.5 text-xs text-foreground/50">#{row.original.id}</p>
          </div>
        ),
        meta: { headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-6 py-3' },
      },
      {
        id: 'type',
        header: t('settings.popupAds.table.type'),
        accessorFn: (row) => row.type || '',
        cell: ({ row }) => (
          <span class={[
            'inline-flex rounded-full px-2 py-1 text-xs font-medium uppercase',
            row.original.type === 'url' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600',
          ]}>
            {t(`settings.popupAds.types.${row.original.type}`)}
          </span>
        ),
        meta: { headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-6 py-3' },
      },
      {
        id: 'target',
        header: t('settings.popupAds.table.target'),
        accessorFn: (row) => row.value || '',
        cell: ({ row }) => (
          <div class="max-w-[320px]">
            <code class={[
              'block truncate text-xs',
              row.original.type === 'script' ? 'font-mono text-foreground/60' : 'text-foreground/60',
            ]}>
              {row.original.value}
            </code>
          </div>
        ),
        enableSorting: false,
        meta: { headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-6 py-3' },
      },
      {
        id: 'maxTriggersPerSession',
        header: t('settings.popupAds.table.maxTriggersPerSession'),
        accessorFn: (row) => row.maxTriggersPerSession || 0,
        cell: ({ row }) => <span class="text-foreground/70">{row.original.type === 'url' ? row.original.maxTriggersPerSession || 0 : '—'}</span>,
        meta: { headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-6 py-3 text-foreground/70' },
      },
      {
        id: 'status',
        header: t('common.status'),
        accessorFn: (row) => Number(Boolean(row.isActive)),
        cell: ({ row }) => (
          <div class="text-center">
            <AppSwitch
              modelValue={Boolean(row.original.isActive)}
              disabled={props.disabled}
              onUpdate:modelValue={(value: boolean) => emit('toggle-active', { item: row.original, value })}
            />
          </div>
        ),
        meta: { headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-6 py-3 text-center' },
      },
      {
        id: 'actions',
        header: t('common.actions'),
        enableSorting: false,
        cell: ({ row }) => (
          <div class="flex items-center justify-center gap-2">
            <AppButton variant="ghost" size="icon" disabled={props.disabled} onClick={() => emit('edit', row.original)} v-slots={{ icon: () => <PencilIcon filled class="h-4 w-4" /> }} />
            <AppButton variant="ghost" size="icon" disabled={props.disabled} onClick={() => emit('delete', row.original)} v-slots={{ icon: () => <TrashIcon filled class="h-4 w-4" /> }} />
          </div>
        ),
        meta: { headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50 [&>div]:justify-center', cellClass: 'px-6 py-3 text-center' },
      },
    ]);

    return () => (
      <BaseTable
        data={props.items}
        columns={columns.value}
        loading={props.isLoading}
        getRowId={(row: PopupAdItem) => String(row.id)}
        wrapperClass="mt-4 border-b border-border rounded-none border-x-0 border-t-0 bg-transparent"
        tableClass="w-full"
        headerRowClass="bg-muted/30"
        bodyRowClass="border-b border-border hover:bg-muted/30"
        pagination
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        totalRecords={props.totalRecords}
        rowsPerPage={props.rowsPerPage}
        pageSizeOptions={props.pageSizeOptions}
        canPreviousPage={props.canPreviousPage}
        canNextPage={props.canNextPage}
        onPrevious-page={() => emit('previous-page')}
        onNext-page={() => emit('next-page')}
        onPage-size-change={(value: number) => emit('page-size-change', value)}
        v-slots={{
          empty: () => (
            <div class="px-6 py-12 text-center">
              <LinkIcon class="mx-auto mb-3 block h-10 w-10 text-foreground/30" />
              <p class="mb-1 text-sm text-foreground/60">{t('settings.popupAds.emptyTitle')}</p>
              <p class="text-xs text-foreground/40">{t('settings.popupAds.emptySubtitle')}</p>
            </div>
          ),
        }}
      />
    );
  },
});
