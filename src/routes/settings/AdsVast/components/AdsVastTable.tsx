import { useAppToast } from '@/composables/useAppToast';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';
import { computed, defineComponent, type PropType } from 'vue';
import type { AdTemplate } from '../types';

// Components
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppSwitch from '@/components/ui/AppSwitch.vue';
import BaseTable from '@/components/ui/BaseTable.vue';
import SettingsTableSkeleton from '@/routes/settings/components/SettingsTableSkeleton.vue';
import { formatDate } from '../../DomainsDns/helpers';

export default defineComponent({
  name: 'AdTemplateTable',
  props: {
    templates: { type: Array as PropType<AdTemplate[]>, required: true },
    isInitialLoading: { type: Boolean, default: false },
    isReadOnly: { type: Boolean, default: false },
    isMutating: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    deletingId: { type: String as PropType<string | null>, default: null },
    togglingId: { type: String as PropType<string | null>, default: null },
    defaultingId: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    edit: (template: AdTemplate) => true,
    delete: (template: AdTemplate) => true,
    'toggle-active': (payload: { template: AdTemplate; value: boolean }) => true,
    'set-default': (template: AdTemplate) => true,
  },
  setup(props, { emit }) {
    const toast = useAppToast();
    const { t } = useTranslation();

    const adFormatLabels = computed<Record<string, string>>(() => ({
      'pre-roll': t('settings.adsVast.formats.preRoll'),
      'mid-roll': t('settings.adsVast.formats.midRoll'),
      'post-roll': t('settings.adsVast.formats.postRoll'),
    }));

    const getAdFormatLabel = (format?: string) => adFormatLabels.value[format || ''] || format || '-';

    const getAdFormatColor = (format?: string) => {
      const colors: Record<string, string> = {
        'pre-roll': 'bg-blue-500/10 text-blue-500',
        'mid-roll': 'bg-yellow-500/10 text-yellow-500',
        'post-roll': 'bg-purple-500/10 text-purple-500',
      };
      return colors[format || ''] || 'bg-gray-500/10 text-gray-500';
    };

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      toast.add({
        severity: 'success',
        summary: t('settings.adsVast.toast.copiedSummary'),
        detail: t('settings.adsVast.toast.copiedDetail'),
        life: 2000,
      });
    };

    const columns = computed<ColumnDef<AdTemplate>[]>(() => [
      {
        id: 'template',
        header: t('settings.adsVast.table.template'),
        accessorFn: (row) => row.name || '',
        cell: ({ row }) => (
          <>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-foreground">{row.original.name || ''}</span>
              {row.original.isDefault && (
                <span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {t('settings.adsVast.defaultBadge')}
                </span>
              )}
            </div>
            <p class="mt-0.5 text-xs text-foreground/50">
              {t('settings.adsVast.createdOn', { date: formatDate(row.original.createdAt) || '-' })}
            </p>
          </>
        ),
        meta: {
          headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
          cellClass: 'px-6 py-3',
        },
      },
      {
        id: 'format',
        header: t('settings.adsVast.table.format'),
        accessorFn: (row) => row.adFormat || '',
        cell: ({ row }) => (
          <div>
            <span class={['rounded-full px-2 py-1 text-xs font-medium', getAdFormatColor(row.original.adFormat)]}>
              {getAdFormatLabel(row.original.adFormat)}
            </span>
            {row.original.adFormat === 'mid-roll' && row.original.duration && (
              <span class="ml-2 text-xs text-foreground/50">({row.original.duration}s)</span>
            )}
          </div>
        ),
        meta: {
          headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
          cellClass: 'px-6 py-3',
        },
      },
      {
        id: 'vastUrl',
        header: t('settings.adsVast.table.vastUrl'),
        accessorFn: (row) => row.vastTagUrl || '',
        cell: ({ row }) => (
          <div class="flex max-w-[240px] items-center gap-2">
            <code class="truncate text-xs text-foreground/60">{row.original.vastTagUrl || ''}</code>
            <AppButton
              variant="ghost"
              size="sm"
              disabled={props.isMutating || !row.original.vastTagUrl}
              onClick={() => copyToClipboard(row.original.vastTagUrl || '')}
              v-slots={{
                icon: () => <CheckIcon class="h-4 w-4" />
              }}
            />
          </div>
        ),
        enableSorting: false,
        meta: {
          headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
          cellClass: 'px-6 py-3',
        },
      },
      {
        id: 'status',
        header: t('common.status'),
        accessorFn: (row) => Number(Boolean(row.isActive)),
        cell: ({ row }) => (
          <div class="text-center">
            <AppSwitch
              modelValue={Boolean(row.original.isActive)}
              disabled={
                props.isReadOnly ||
                props.saving ||
                props.deletingId !== null ||
                props.defaultingId !== null ||
                props.togglingId === row.original.id
              }
              onUpdate:modelValue={(value: boolean) => emit('toggle-active', { template: row.original, value })}
            />
          </div>
        ),
        meta: {
          headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50',
          cellClass: 'px-6 py-3 text-center',
        },
      },
      {
        id: 'actions',
        header: t('common.actions'),
        enableSorting: false,
        cell: ({ row }) => (
          <div class="flex flex-wrap items-center justify-center gap-2">
            {!row.original.isDefault && (
              <AppButton
                variant="ghost"
                size="sm"
                loading={props.defaultingId === row.original.id}
                disabled={
                  props.isReadOnly ||
                  props.saving ||
                  props.deletingId !== null ||
                  props.togglingId !== null ||
                  props.defaultingId !== null ||
                  !Boolean(row.original.isActive)
                }
                onClick={() => emit('set-default', row.original)}
              >
                {t('settings.adsVast.actions.setDefault')}
              </AppButton>
            )}
            <AppButton
              variant="ghost"
              size="sm"
              disabled={props.isReadOnly || props.isMutating}
              onClick={() => emit('edit', row.original)}
              v-slots={{
                icon: () => <PencilIcon class="h-4 w-4" />
              }}
            />
            <AppButton
              variant="ghost"
              size="sm"
              disabled={props.isReadOnly || props.isMutating}
              onClick={() => emit('delete', row.original)}
              v-slots={{
                icon: () => <TrashIcon class="h-4 w-4 text-danger" />
              }}
            />
          </div>
        ),
        meta: {
          headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50 [&>div]:justify-center',
          cellClass: 'px-6 py-3 text-center',
        },
      },
    ]);
    
    return () => (
      <>
        {props.isInitialLoading ? (
          <SettingsTableSkeleton columns={5} rows={4} />
        ) : (
          <BaseTable
            data={props.templates}
            columns={columns.value}
            getRowId={(row: AdTemplate, index: number) => 
              row.id || `${row.name || 'template'}:${row.vastTagUrl || index}`
            }
            wrapperClass="mt-4 border-b border-border rounded-none border-x-0 border-t-0 bg-transparent"
            tableClass="w-full"
            headerRowClass="bg-muted/30"
            bodyRowClass="border-b border-border hover:bg-muted/30"
            v-slots={{
              empty: () => (
                <div class="px-6 py-12 text-center">
                  <LinkIcon class="mx-auto mb-3 block h-10 w-10 text-foreground/30" />
                  <p class="mb-1 text-sm text-foreground/60">{t('settings.adsVast.emptyTitle')}</p>
                  <p class="text-xs text-foreground/40">{t('settings.adsVast.emptySubtitle')}</p>
                </div>
              )
            }}
          />
        )}
      </>
    );
  },
});