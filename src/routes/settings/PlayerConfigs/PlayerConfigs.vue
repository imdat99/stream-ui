<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';
import PlayerConfigDialog from './components/PlayerConfigDialog.vue';
import PlayerConfigsNotices from './components/PlayerConfigsNotices.vue';
import PlayerConfigsTable from './components/PlayerConfigsTable.vue';
import PlayerConfigsToolbar from './components/PlayerConfigsToolbar.vue';
import type { PlayerConfig, PlayerConfigApiItem, PlayerConfigFormData } from './types';

const toast = useAppToast();
const confirm = useAppConfirm();
const auth = useAuthStore();
const { t } = useTranslation();

const createInitialFormData = (): PlayerConfigFormData => ({
    name: '',
    description: '',
    autoplay: false,
    loop: false,
    muted: false,
    showControls: true,
    pip: true,
    airplay: true,
    chromecast: true,
    encrytionM3u8: true,
    logoUrl: '',
    isDefault: false,
});

const showAddDialog = ref(false);
const editingConfig = ref<PlayerConfig | null>(null);
const saving = ref(false);
const deletingId = ref<string | null>(null);
const togglingId = ref<string | null>(null);
const defaultingId = ref<string | null>(null);
const formData = ref<PlayerConfigFormData>(createInitialFormData());

const FREE_PLAN_LIMIT_MESSAGE = 'Free plan supports only 1 player config';
const FREE_PLAN_RECONCILIATION_MESSAGE = 'Delete extra player configs to continue managing player configs on the free plan';

const isFreePlan = computed(() => !auth.user?.plan_id);
const isMutating = computed(() => saving.value || deletingId.value !== null || togglingId.value !== null || defaultingId.value !== null);

const mapConfig = (item: PlayerConfigApiItem): PlayerConfig => ({
    id: item.id || `${item.name || 'config'}:${item.createdAt || ''}`,
    name: item.name || '',
    description: item.description || undefined,
    autoplay: Boolean(item.autoplay),
    loop: Boolean(item.loop),
    muted: Boolean(item.muted),
    showControls: item.showControls !== false,
    pip: item.pip !== false,
    airplay: item.airplay !== false,
    chromecast: item.chromecast !== false,
    encrytionM3u8: item.encrytionM3u8 !== false,
    logoUrl: item.logoUrl || undefined,
    isActive: item.isActive !== false,
    isDefault: Boolean(item.isDefault),
    createdAt: item.createdAt || '',
});

const { data: configsSnapshot, error, isPending, refetch } = useQuery({
    key: () => ['settings', 'player-configs'],
    query: async () => {
        const response = await rpcClient.listPlayerConfigs();
        return (response.configs || []).map(mapConfig);
    },
});

const configs = computed(() => configsSnapshot.value || []);
const isInitialLoading = computed(() => isPending.value && !configsSnapshot.value);
const configCount = computed(() => configs.value.length);
const hasExactlyOneConfig = computed(() => configCount.value === 1);
const isFreeReconciliationMode = computed(() => isFreePlan.value && configCount.value > 1);
const canCreateConfig = computed(() => !isInitialLoading.value && !isMutating.value && (!isFreePlan.value || configCount.value === 0));
const canManageExistingConfig = computed(() => !isMutating.value && (!isFreePlan.value || hasExactlyOneConfig.value));
const canDeleteConfig = computed(() => !isMutating.value);
const canEditDialog = computed(() => !saving.value && (!isFreePlan.value || hasExactlyOneConfig.value));
const canSubmitDialog = computed(() => editingConfig.value ? canManageExistingConfig.value : canCreateConfig.value);

// const refetchConfigs = () => refetch((fetchError) => {
//     throw fetchError;
// });

const getErrorMessage = (value: any, fallback: string) => value?.error?.message || value?.message || value?.data?.message || fallback;

const showQuotaToast = (key: 'limit' | 'reconciliation') => {
    toast.add({
        severity: 'warn',
        summary: t(`settings.playerConfigs.toast.${key}Summary`),
        detail: t(`settings.playerConfigs.toast.${key}Detail`),
        life: 4000,
    });
};

const showActionErrorToast = (value: any) => {
    const message = getErrorMessage(value, t('settings.playerConfigs.toast.failedDetail'));
    if (message === FREE_PLAN_LIMIT_MESSAGE) {
        showQuotaToast('limit');
        return;
    }
    if (message === FREE_PLAN_RECONCILIATION_MESSAGE) {
        showQuotaToast('reconciliation');
        return;
    }
    toast.add({
        severity: 'error',
        summary: t('settings.playerConfigs.toast.failedSummary'),
        detail: message,
        life: 5000,
    });
};

const ensureCanCreateConfig = () => {
    if (canCreateConfig.value) return true;
    if (isFreePlan.value && configCount.value >= 1) {
        showQuotaToast('limit');
    }
    return false;
};

const ensureCanManageExistingConfig = () => {
    if (canManageExistingConfig.value) return true;
    if (isFreeReconciliationMode.value) {
        showQuotaToast('reconciliation');
    }
    return false;
};

watch(error, (value, previous) => {
    if (!value || value === previous || isMutating.value) return;
    showActionErrorToast(value);
});

const resetForm = () => {
    formData.value = createInitialFormData();
    editingConfig.value = null;
};

const closeDialog = () => {
    showAddDialog.value = false;
    resetForm();
};

const openAddDialog = () => {
    if (!ensureCanCreateConfig()) return;
    resetForm();
    showAddDialog.value = true;
};

const applyConfigToForm = (config: PlayerConfig) => {
    formData.value = {
        name: config.name,
        description: config.description || '',
        autoplay: config.autoplay,
        loop: config.loop,
        muted: config.muted,
        showControls: config.showControls,
        pip: config.pip,
        airplay: config.airplay,
        chromecast: config.chromecast,
        encrytionM3u8: config.encrytionM3u8,
        logoUrl: config.logoUrl || '',
        isDefault: config.isDefault,
    };
};

const openEditDialog = (config: PlayerConfig) => {
    if (!ensureCanManageExistingConfig()) return;
    applyConfigToForm(config);
    editingConfig.value = config;
    showAddDialog.value = true;
};

const buildRequestBody = (enabled = true) => ({
    name: formData.value.name.trim(),
    description: formData.value.description.trim() || undefined,
    autoplay: formData.value.autoplay,
    loop: formData.value.loop,
    muted: formData.value.muted,
    showControls: formData.value.showControls,
    pip: formData.value.pip,
    airplay: formData.value.airplay,
    chromecast: formData.value.chromecast,
    encrytionM3u8: formData.value.encrytionM3u8,
    logoUrl: formData.value.logoUrl.trim() || undefined,
    isActive: enabled,
    isDefault: enabled ? formData.value.isDefault : false,
});

const handleSave = async () => {
    if (saving.value) return;
    if (editingConfig.value) {
        if (!ensureCanManageExistingConfig()) return;
    } else if (!ensureCanCreateConfig()) {
        return;
    }

    if (!formData.value.name.trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.playerConfigs.toast.nameRequiredSummary'),
            detail: t('settings.playerConfigs.toast.nameRequiredDetail'),
            life: 3000,
        });
        return;
    }

    saving.value = true;
    try {
        if (editingConfig.value) {
            await rpcClient.updatePlayerConfig({
                id: editingConfig.value.id,
                ...buildRequestBody(editingConfig.value.isActive),
            });
            toast.add({
                severity: 'success',
                summary: t('settings.playerConfigs.toast.updatedSummary'),
                detail: t('settings.playerConfigs.toast.updatedDetail'),
                life: 3000,
            });
        } else {
            await rpcClient.createPlayerConfig(buildRequestBody(true));
            toast.add({
                severity: 'success',
                summary: t('settings.playerConfigs.toast.createdSummary'),
                detail: t('settings.playerConfigs.toast.createdDetail'),
                life: 3000,
            });
        }

        await refetch();
        closeDialog();
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        saving.value = false;
    }
};

const handleToggle = async (config: PlayerConfig, nextValue: boolean) => {
    if (!ensureCanManageExistingConfig()) return;

    togglingId.value = config.id;
    try {
        await rpcClient.updatePlayerConfig({
            id: config.id,
            name: config.name,
            description: config.description,
            autoplay: config.autoplay,
            loop: config.loop,
            muted: config.muted,
            showControls: config.showControls,
            pip: config.pip,
            airplay: config.airplay,
            chromecast: config.chromecast,
            encrytionM3u8: config.encrytionM3u8,
            logoUrl: config.logoUrl,
            isActive: nextValue,
            isDefault: nextValue ? config.isDefault : false,
        });

        await refetch();
        toast.add({
            severity: 'info',
            summary: nextValue
                ? t('settings.playerConfigs.toast.enabledSummary')
                : t('settings.playerConfigs.toast.disabledSummary'),
            detail: t('settings.playerConfigs.toast.toggleDetail', {
                name: config.name,
                state: nextValue
                    ? t('settings.playerConfigs.state.enabled')
                    : t('settings.playerConfigs.state.disabled'),
            }),
            life: 2000,
        });
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        togglingId.value = null;
    }
};

const handleSetDefault = async (config: PlayerConfig) => {
    if (config.isDefault || !config.isActive || !ensureCanManageExistingConfig()) return;

    defaultingId.value = config.id;
    try {
        await rpcClient.updatePlayerConfig({
            id: config.id,
            name: config.name,
            description: config.description,
            autoplay: config.autoplay,
            loop: config.loop,
            muted: config.muted,
            showControls: config.showControls,
            pip: config.pip,
            airplay: config.airplay,
            chromecast: config.chromecast,
            encrytionM3u8: config.encrytionM3u8,
            logoUrl: config.logoUrl,
            isActive: config.isActive,
            isDefault: true,
        });

        await refetch();
        toast.add({
            severity: 'success',
            summary: t('settings.playerConfigs.toast.defaultUpdatedSummary'),
            detail: t('settings.playerConfigs.toast.defaultUpdatedDetail', { name: config.name }),
            life: 3000,
        });
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        defaultingId.value = null;
    }
};

const handleDelete = (config: PlayerConfig) => {
    if (!canDeleteConfig.value) return;

    confirm.require({
        message: t('settings.playerConfigs.confirm.deleteMessage', { name: config.name }),
        header: t('settings.playerConfigs.confirm.deleteHeader'),
        acceptLabel: t('settings.playerConfigs.confirm.deleteAccept'),
        rejectLabel: t('settings.playerConfigs.confirm.deleteReject'),
        accept: async () => {
            deletingId.value = config.id;
            try {
                await rpcClient.deletePlayerConfig({ id: config.id });
                await refetch();
                toast.add({
                    severity: 'info',
                    summary: t('settings.playerConfigs.toast.deletedSummary'),
                    detail: t('settings.playerConfigs.toast.deletedDetail'),
                    life: 3000,
                });
            } catch (value: any) {
                console.error(value);
                showActionErrorToast(value);
            } finally {
                deletingId.value = null;
            }
        },
    });
};
</script>

<template>
    <SettingsSectionCard
        :title="t('settings.content.playerConfigs.title')"
        :description="t('settings.content.playerConfigs.subtitle')"
        bodyClass=""
    >
        <template #header-actions>
            <PlayerConfigsToolbar :can-create-config="canCreateConfig" @create="openAddDialog" />
        </template>

        <PlayerConfigsNotices
            :is-free-plan="isFreePlan"
            :is-free-reconciliation-mode="isFreeReconciliationMode"
        />

        <PlayerConfigsTable
            :configs="configs"
            :is-initial-loading="isInitialLoading"
            :can-manage-existing-config="canManageExistingConfig"
            :can-delete-config="canDeleteConfig"
            :saving="saving"
            :deleting-id="deletingId"
            :toggling-id="togglingId"
            :defaulting-id="defaultingId"
            @edit="openEditDialog"
            @delete="handleDelete"
            @toggle-active="handleToggle($event.config, $event.value)"
            @set-default="handleSetDefault"
        />

        <PlayerConfigDialog
            :visible="showAddDialog"
            :editing-config="editingConfig"
            :form-data="formData"
            :saving="saving"
            :can-edit-dialog="canEditDialog"
            :can-submit="canSubmitDialog"
            @update:visible="showAddDialog = $event"
            @update:form-data="formData = $event"
            @save="handleSave"
            @close="closeDialog"
        />
    </SettingsSectionCard>
</template>
