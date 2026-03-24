<script setup lang="ts">
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppSwitch from '@/components/ui/AppSwitch.vue';
import BaseTable from '@/components/ui/BaseTable.vue';
import SettingsTableSkeleton from '@/routes/settings/components/SettingsTableSkeleton.vue';
import type { ColumnDef } from '@tanstack/vue-table';
import { useTranslation } from 'i18next-vue';
import { computed, h } from 'vue';
import PlayerConfigSettingsBadges from './PlayerConfigSettingsBadges.vue';
import type { PlayerConfig } from '../types';

const props = defineProps<{
    configs: PlayerConfig[];
    isInitialLoading: boolean;
    canManageExistingConfig: boolean;
    canDeleteConfig: boolean;
    saving: boolean;
    deletingId: string | null;
    togglingId: string | null;
    defaultingId: string | null;
}>();

const emit = defineEmits<{
    (e: 'edit', config: PlayerConfig): void;
    (e: 'delete', config: PlayerConfig): void;
    (e: 'toggle-active', payload: { config: PlayerConfig; value: boolean }): void;
    (e: 'set-default', config: PlayerConfig): void;
}>();

const { t } = useTranslation();

const columns = computed<ColumnDef<PlayerConfig>[]>(() => [
    {
        id: 'config',
        header: t('settings.playerConfigs.table.name'),
        accessorFn: row => row.name,
        cell: ({ row }) => h('div', [
            h('div', { class: 'flex flex-wrap items-center gap-2' }, [
                h('span', { class: 'text-sm font-medium text-foreground cursor-pointer hover:underline', onClick: () => emit('edit', row.original) }, row.original.name),
                row.original.isDefault
                    ? h('span', {
                        class: 'inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary',
                    }, t('settings.playerConfigs.defaultBadge'))
                    : null,
            ]),
            row.original.description
                ? h('p', { class: 'mt-0.5 text-xs text-foreground/50' }, row.original.description)
                : h('p', { class: 'mt-0.5 text-xs text-foreground/40' }, t('settings.playerConfigs.createdOn', { date: row.original.createdAt || '-' })),
        ]),
        meta: {
            headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
            cellClass: 'px-6 py-3',
        },
    },
    {
        id: 'settings',
        header: t('settings.playerConfigs.table.settings'),
        accessorFn: row => [
            row.autoplay ? 'autoplay' : '',
            row.loop ? 'loop' : '',
            row.muted ? 'muted' : '',
            row.showControls ? 'controls' : '',
            row.pip ? 'pip' : '',
            row.airplay ? 'airplay' : '',
            row.chromecast ? 'chromecast' : '',
            row.encrytionM3u8 ? 'encrytionM3u8' : '',
            row.logoUrl ? 'logo' : '',
        ].filter(Boolean).join(', '),
        cell: ({ row }) => h(PlayerConfigSettingsBadges, { config: row.original }),
        meta: {
            headerClass: 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50',
            cellClass: 'px-6 py-3',
        },
    },
    {
        id: 'status',
        header: t('common.status'),
        accessorFn: row => Number(row.isActive),
        cell: ({ row }) => h('div', { class: 'text-center' }, [
            h(AppSwitch, {
                modelValue: row.original.isActive,
                disabled: !props.canManageExistingConfig || props.saving || props.deletingId !== null || props.defaultingId !== null || props.togglingId === row.original.id,
                'onUpdate:modelValue': (value: boolean) => emit('toggle-active', { config: row.original, value }),
            }),
        ]),
        meta: {
            headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50',
            cellClass: 'px-6 py-3 text-center',
        },
    },
    {
        id: 'actions',
        header: t('common.actions'),
        enableSorting: false,
        cell: ({ row }) => h('div', { class: 'flex flex-wrap items-center justify-end gap-2' }, [
            row.original.isDefault
                ? h('span', {
                    class: 'inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary',
                }, t('settings.playerConfigs.actions.default'))
                : h(AppButton, {
                    variant: 'ghost',
                    size: 'sm',
                    loading: props.defaultingId === row.original.id,
                    disabled: !props.canManageExistingConfig || props.saving || props.deletingId !== null || props.togglingId !== null || props.defaultingId !== null || !row.original.isActive,
                    onClick: () => emit('set-default', row.original),
                }, () => t('settings.playerConfigs.actions.setDefault')),
            h(AppButton, {
                variant: 'ghost',
                size: 'sm',
                disabled: !props.canManageExistingConfig,
                onClick: () => emit('edit', row.original),
            }, {
                icon: () => h(PencilIcon, { class: 'h-4 w-4' }),
            }),
            h(AppButton, {
                variant: 'ghost',
                size: 'sm',
                disabled: !props.canDeleteConfig,
                onClick: () => emit('delete', row.original),
            }, {
                icon: () => h(TrashIcon, { class: 'h-4 w-4 text-danger' }),
            }),
        ]),
        meta: {
            headerClass: 'px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground/50 [&>div]:justify-center',
            cellClass: 'px-6 py-3 text-right',
        },
    },
]);
</script>

<template>
    <SettingsTableSkeleton v-if="isInitialLoading" :columns="5" :rows="4" />

    <BaseTable
        v-else
        :data="configs"
        :columns="columns"
        :get-row-id="(row) => row.id"
        wrapperClass="mt-4 border-b border-border rounded-none border-x-0 border-t-0 bg-transparent"
        tableClass="w-full"
        headerRowClass="bg-muted/30"
        bodyRowClass="border-b border-border hover:bg-muted/30"
    >
        <template #empty>
            <div class="px-6 py-12 text-center">
                <LinkIcon class="mx-auto mb-3 block h-10 w-10 text-foreground/30" />
                <p class="mb-1 text-sm text-foreground/60">{{ t('settings.playerConfigs.emptyTitle') }}</p>
                <p class="text-xs text-foreground/40">{{ t('settings.playerConfigs.emptySubtitle') }}</p>
            </div>
        </template>
    </BaseTable>
</template>
