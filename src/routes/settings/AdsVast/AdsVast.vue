<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import AdsVastDialog from './components/AdsVastDialog.vue';
import AdsVastNotices from './components/AdsVastNotices.vue';
import AdsVastTable from './components/AdsVastTable.tsx';
import AdsVastToolbar from './components/AdsVastToolbar.vue';
import type {
    AdTemplate,
    CreateAdTemplateRequest
} from './types';

const toast = useAppToast();
const confirm = useAppConfirm();
const auth = useAuthStore();
const { t } = useTranslation();

const createInitialFormData = (): CreateAdTemplateRequest => ({
    name: '',
    description: '',
    vastTagUrl: '',
    adFormat: 'pre-roll',
    duration: undefined,
    isActive: true,
    isDefault: false,
});

const showAddDialog = ref(false);
const editingTemplate = ref<AdTemplate | null>(null);
const saving = ref(false);
const deletingId = ref<string | null>(null);
const togglingId = ref<string | null>(null);
const defaultingId = ref<string | null>(null);
const formData = ref<CreateAdTemplateRequest>(createInitialFormData());

const isFreePlan = computed(() => !auth.user?.plan_id);
const isMutating = computed(() => saving.value || deletingId.value !== null || togglingId.value !== null || defaultingId.value !== null);

const { data: templatesSnapshot, error, isPending, refetch } = useQuery({
    key: () => ['settings', 'ad-templates'],
    query: async () => {
        const response = await rpcClient.listAdTemplates();
        return response.templates || [];
    },
});

const templates = computed<AdTemplate[]>(() => templatesSnapshot.value || []);
const isInitialLoading = computed(() => isPending.value && !templatesSnapshot.value);
const canCreateTemplate = computed(() => !isFreePlan.value && !isInitialLoading.value && !isMutating.value);
const canEditDialog = computed(() => !isFreePlan.value && !saving.value);

const getErrorMessage = (value: any, fallback: string) => value?.error?.message || value?.message || value?.data?.message || fallback;

const showActionErrorToast = (value: any) => {
    toast.add({
        severity: 'error',
        summary: t('settings.adsVast.toast.failedSummary'),
        detail: getErrorMessage(value, t('settings.adsVast.toast.failedDetail')),
        life: 5000,
    });
};

const showUpgradeRequiredToast = () => {
    toast.add({
        severity: 'warn',
        summary: t('settings.adsVast.toast.upgradeRequiredSummary'),
        detail: t('settings.adsVast.toast.upgradeRequiredDetail'),
        life: 4000,
    });
};

const ensurePaidPlan = () => {
    if (!isFreePlan.value) return true;
    showUpgradeRequiredToast();
    return false;
};

watch(error, (value, previous) => {
    if (!value || value === previous || isMutating.value) return;
    showActionErrorToast(value);
});

const resetForm = () => {
    formData.value = createInitialFormData();
    editingTemplate.value = null;
};

const closeDialog = () => {
    showAddDialog.value = false;
    resetForm();
};

const openAddDialog = () => {
    if (!ensurePaidPlan()) return;
    resetForm();
    showAddDialog.value = true;
};

const applyTemplateToForm = (template: AdTemplate) => {
    formData.value = {
        name: template.name || '',
        description: template.description || '',
        vastTagUrl: template.vastTagUrl || '',
        adFormat: template.adFormat || 'pre-roll',
        duration: template.duration,
        isActive: template.isActive,
        isDefault: Boolean(template.isDefault),
    };
};

const openEditDialog = (template: AdTemplate) => {
    if (!ensurePaidPlan()) return;
    applyTemplateToForm(template);
    editingTemplate.value = template;
    showAddDialog.value = true;
};

const buildRequestBody = (enabled = true): Parameters<typeof rpcClient.createAdTemplate>[0] => ({
    ...formData.value,
    name: (formData.value.name || '').trim(),
    description: '',
    vastTagUrl: (formData.value.vastTagUrl || '').trim(),
    adFormat: formData.value.adFormat || 'pre-roll',
    duration: formData.value.adFormat === 'mid-roll' ? formData.value.duration : undefined,
    isActive: enabled,
    isDefault: enabled ? Boolean(formData.value.isDefault) : false,
});

const handleSave = async () => {
    if (saving.value || !ensurePaidPlan()) return;

    if (!(formData.value.name || '').trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.nameRequiredSummary'),
            detail: t('settings.adsVast.toast.nameRequiredDetail'),
            life: 3000,
        });
        return;
    }
    if (!(formData.value.vastTagUrl || '').trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.urlRequiredSummary'),
            detail: t('settings.adsVast.toast.urlRequiredDetail'),
            life: 3000,
        });
        return;
    }
    try {
        new URL(formData.value.vastTagUrl || '');
    } catch {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.invalidUrlSummary'),
            detail: t('settings.adsVast.toast.invalidUrlDetail'),
            life: 3000,
        });
        return;
    }
    if (formData.value.adFormat === 'mid-roll' && (!formData.value.duration || formData.value.duration <= 0)) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.durationRequiredSummary'),
            detail: t('settings.adsVast.toast.durationRequiredDetail'),
            life: 3000,
        });
        return;
    }

    saving.value = true;
    try {
        if (editingTemplate.value) {
            await rpcClient.updateAdTemplate({
                id: editingTemplate.value.id || '',
                ...buildRequestBody(Boolean(editingTemplate.value.isActive)),
            });
            toast.add({
                severity: 'success',
                summary: t('settings.adsVast.toast.updatedSummary'),
                detail: t('settings.adsVast.toast.updatedDetail'),
                life: 3000,
            });
        } else {
            await rpcClient.createAdTemplate(buildRequestBody(true));
            toast.add({
                severity: 'success',
                summary: t('settings.adsVast.toast.createdSummary'),
                detail: t('settings.adsVast.toast.createdDetail'),
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

const handleToggle = async (template: AdTemplate, nextValue: boolean) => {
    if (!ensurePaidPlan()) return;

    togglingId.value = template.id || null;
    try {
        await rpcClient.updateAdTemplate({
            id: template.id || '',
            name: template.name || '',
            description: template.description || '',
            vastTagUrl: template.vastTagUrl || '',
            adFormat: template.adFormat,
            duration: template.adFormat === 'mid-roll' ? template.duration : undefined,
            isActive: nextValue,
            isDefault: nextValue ? Boolean(template.isDefault) : false,
        });

        await refetch();
        toast.add({
            severity: 'info',
            summary: nextValue
                ? t('settings.adsVast.toast.enabledSummary')
                : t('settings.adsVast.toast.disabledSummary'),
            detail: t('settings.adsVast.toast.toggleDetail', {
                name: template.name || '',
                state: nextValue
                    ? t('settings.adsVast.state.enabled')
                    : t('settings.adsVast.state.disabled'),
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

const handleSetDefault = async (template: AdTemplate) => {
    if (Boolean(template.isDefault) || !Boolean(template.isActive) || !ensurePaidPlan()) return;

    defaultingId.value = template.id || null;
    try {
        await rpcClient.updateAdTemplate({
            id: template.id || '',
            name: template.name || '',
            description: template.description || '',
            vastTagUrl: template.vastTagUrl || '',
            adFormat: template.adFormat,
            duration: template.adFormat === 'mid-roll' ? template.duration : undefined,
            isActive: template.isActive,
            isDefault: true,    
        });

        await refetch();
        toast.add({
            severity: 'success',
            summary: t('settings.adsVast.toast.defaultUpdatedSummary'),
            detail: t('settings.adsVast.toast.defaultUpdatedDetail', { name: template.name || '' }),
            life: 3000,
        });
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        defaultingId.value = null;
    }
};

const handleDelete = (template: AdTemplate) => {
    if (!ensurePaidPlan()) return;

    confirm.require({
        message: t('settings.adsVast.confirm.deleteMessage', { name: template.name || '' }),
        header: t('settings.adsVast.confirm.deleteHeader'),
        acceptLabel: t('settings.adsVast.confirm.deleteAccept'),
        rejectLabel: t('settings.adsVast.confirm.deleteReject'),
        accept: async () => {
            deletingId.value = template.id || null;
            try {
                await rpcClient.deleteAdTemplate({ id: template.id || '' });
                await refetch();
                toast.add({
                    severity: 'info',
                    summary: t('settings.adsVast.toast.deletedSummary'),
                    detail: t('settings.adsVast.toast.deletedDetail'),
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
        :title="t('settings.content.ads.title')"
        :description="t('settings.content.ads.subtitle')"
        bodyClass=""
    >
        <template #header-actions>
            <AdsVastToolbar :disabled="!canCreateTemplate" @create="openAddDialog" />
        </template>

        <AdsVastNotices :is-free-plan="isFreePlan" />

        <AdsVastTable
            :templates="templates"
            :is-initial-loading="isInitialLoading"
            :is-read-only="isFreePlan"
            :is-mutating="isMutating"
            :saving="saving"
            :deleting-id="deletingId"
            :toggling-id="togglingId"
            :defaulting-id="defaultingId"
            @edit="openEditDialog"
            @delete="handleDelete"
            @toggle-active="handleToggle($event.template, $event.value)"
            @set-default="handleSetDefault"
        />

        <AdsVastDialog
            :visible="showAddDialog"
            :editing-template="editingTemplate"
            :form-data="formData"
            :saving="saving"
            :can-edit="canEditDialog"
            @update:visible="showAddDialog = $event"
            @update:form-data="formData = $event"
            @save="handleSave"
            @close="closeDialog"
        />
    </SettingsSectionCard>
</template>
