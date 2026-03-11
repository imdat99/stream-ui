<script setup lang="ts">
import { client } from '@/api/client';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import SettingsTableSkeleton from '@/routes/settings/components/SettingsTableSkeleton.vue';
import { useAuthStore } from '@/stores/auth';
import { useQuery } from '@pinia/colada';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const confirm = useAppConfirm();
const auth = useAuthStore();
const { t } = useTranslation();

interface VastTemplate {
    id: string;
    name: string;
    vastUrl: string;
    adFormat: 'pre-roll' | 'mid-roll' | 'post-roll';
    duration?: number;
    enabled: boolean;
    isDefault: boolean;
    createdAt: string;
}

type AdTemplateApiItem = {
    id?: string;
    name?: string;
    vast_tag_url?: string;
    ad_format?: 'pre-roll' | 'mid-roll' | 'post-roll';
    duration?: number | null;
    is_active?: boolean;
    is_default?: boolean;
    created_at?: string;
};

const adFormatOptions = ['pre-roll', 'mid-roll', 'post-roll'] as const;

const showAddDialog = ref(false);
const editingTemplate = ref<VastTemplate | null>(null);
const saving = ref(false);
const deletingId = ref<string | null>(null);
const togglingId = ref<string | null>(null);
const defaultingId = ref<string | null>(null);

const formData = ref({
    name: '',
    vastUrl: '',
    adFormat: 'pre-roll' as 'pre-roll' | 'mid-roll' | 'post-roll',
    duration: undefined as number | undefined,
    isDefault: false,
});

const isFreePlan = computed(() => !auth.user?.plan_id);
const isMutating = computed(() => saving.value || deletingId.value !== null || togglingId.value !== null || defaultingId.value !== null);
const canMarkAsDefaultInDialog = computed(() => !isFreePlan.value && (!editingTemplate.value || editingTemplate.value.enabled));

const mapTemplate = (item: AdTemplateApiItem): VastTemplate => ({
    id: item.id || `${item.name || 'template'}:${item.vast_tag_url || item.created_at || ''}`,
    name: item.name || '',
    vastUrl: item.vast_tag_url || '',
    adFormat: item.ad_format || 'pre-roll',
    duration: typeof item.duration === 'number' ? item.duration : undefined,
    enabled: Boolean(item.is_active),
    isDefault: Boolean(item.is_default),
    createdAt: item.created_at || '',
});

const { data: templatesSnapshot, error, isPending, refetch } = useQuery({
    key: () => ['settings', 'ad-templates'],
    query: async () => {
        const response = await client.adTemplates.adTemplatesList({ baseUrl: '/r' });
        return ((((response.data as any)?.data?.templates) || []) as AdTemplateApiItem[]).map(mapTemplate);
    },
});

const templates = computed(() => templatesSnapshot.value || []);
const isInitialLoading = computed(() => isPending.value && !templatesSnapshot.value);

const refetchTemplates = () => refetch((fetchError) => {
    throw fetchError;
});

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
    formData.value = {
        name: '',
        vastUrl: '',
        adFormat: 'pre-roll',
        duration: undefined,
        isDefault: false,
    };
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

const openEditDialog = (template: VastTemplate) => {
    if (!ensurePaidPlan()) return;
    formData.value = {
        name: template.name,
        vastUrl: template.vastUrl,
        adFormat: template.adFormat,
        duration: template.duration,
        isDefault: template.isDefault,
    };
    editingTemplate.value = template;
    showAddDialog.value = true;
};

const buildRequestBody = (enabled = true) => ({
    name: formData.value.name.trim(),
    vast_tag_url: formData.value.vastUrl.trim(),
    ad_format: formData.value.adFormat,
    duration: formData.value.adFormat === 'mid-roll' ? formData.value.duration : undefined,
    is_active: enabled,
    is_default: enabled ? formData.value.isDefault : false,
});

const handleSave = async () => {
    if (saving.value || !ensurePaidPlan()) return;

    if (!formData.value.name.trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.nameRequiredSummary'),
            detail: t('settings.adsVast.toast.nameRequiredDetail'),
            life: 3000,
        });
        return;
    }
    if (!formData.value.vastUrl.trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.urlRequiredSummary'),
            detail: t('settings.adsVast.toast.urlRequiredDetail'),
            life: 3000,
        });
        return;
    }
    try {
        new URL(formData.value.vastUrl);
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
            await client.adTemplates.adTemplatesUpdate(
                editingTemplate.value.id,
                buildRequestBody(editingTemplate.value.enabled),
                { baseUrl: '/r' },
            );
            toast.add({
                severity: 'success',
                summary: t('settings.adsVast.toast.updatedSummary'),
                detail: t('settings.adsVast.toast.updatedDetail'),
                life: 3000,
            });
        } else {
            await client.adTemplates.adTemplatesCreate(buildRequestBody(true), { baseUrl: '/r' });
            toast.add({
                severity: 'success',
                summary: t('settings.adsVast.toast.createdSummary'),
                detail: t('settings.adsVast.toast.createdDetail'),
                life: 3000,
            });
        }

        await refetchTemplates();
        closeDialog();
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        saving.value = false;
    }
};

const handleToggle = async (template: VastTemplate, nextValue: boolean) => {
    if (!ensurePaidPlan()) return;

    togglingId.value = template.id;
    try {
        await client.adTemplates.adTemplatesUpdate(template.id, {
            name: template.name,
            vast_tag_url: template.vastUrl,
            ad_format: template.adFormat,
            duration: template.adFormat === 'mid-roll' ? template.duration : undefined,
            is_active: nextValue,
            is_default: nextValue ? template.isDefault : false,
        }, { baseUrl: '/r' });

        await refetchTemplates();
        toast.add({
            severity: 'info',
            summary: nextValue
                ? t('settings.adsVast.toast.enabledSummary')
                : t('settings.adsVast.toast.disabledSummary'),
            detail: t('settings.adsVast.toast.toggleDetail', {
                name: template.name,
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

const handleSetDefault = async (template: VastTemplate) => {
    if (template.isDefault || !template.enabled || !ensurePaidPlan()) return;

    defaultingId.value = template.id;
    try {
        await client.adTemplates.adTemplatesUpdate(template.id, {
            name: template.name,
            vast_tag_url: template.vastUrl,
            ad_format: template.adFormat,
            duration: template.adFormat === 'mid-roll' ? template.duration : undefined,
            is_active: template.enabled,
            is_default: true,
        }, { baseUrl: '/r' });

        await refetchTemplates();
        toast.add({
            severity: 'success',
            summary: t('settings.adsVast.toast.defaultUpdatedSummary'),
            detail: t('settings.adsVast.toast.defaultUpdatedDetail', { name: template.name }),
            life: 3000,
        });
    } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
    } finally {
        defaultingId.value = null;
    }
};

const handleDelete = (template: VastTemplate) => {
    if (!ensurePaidPlan()) return;

    confirm.require({
        message: t('settings.adsVast.confirm.deleteMessage', { name: template.name }),
        header: t('settings.adsVast.confirm.deleteHeader'),
        acceptLabel: t('settings.adsVast.confirm.deleteAccept'),
        rejectLabel: t('settings.adsVast.confirm.deleteReject'),
        accept: async () => {
            deletingId.value = template.id;
            try {
                await client.adTemplates.adTemplatesDelete(template.id, { baseUrl: '/r' });
                await refetchTemplates();
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

const adFormatLabels = computed(() => ({
    'pre-roll': t('settings.adsVast.formats.preRoll'),
    'mid-roll': t('settings.adsVast.formats.midRoll'),
    'post-roll': t('settings.adsVast.formats.postRoll'),
}));

const getAdFormatLabel = (format: string) => adFormatLabels.value[format as keyof typeof adFormatLabels.value] || format;

const getAdFormatColor = (format: string) => {
    const colors: Record<string, string> = {
        'pre-roll': 'bg-blue-500/10 text-blue-500',
        'mid-roll': 'bg-yellow-500/10 text-yellow-500',
        'post-roll': 'bg-purple-500/10 text-purple-500',
    };
    return colors[format] || 'bg-gray-500/10 text-gray-500';
};
</script>

<template>
    <SettingsSectionCard
        :title="t('settings.content.ads.title')"
        :description="t('settings.content.ads.subtitle')"
        bodyClass=""
    >
        <template #header-actions>
            <AppButton size="sm" :disabled="isFreePlan || isInitialLoading || isMutating" @click="openAddDialog">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                {{ t('settings.adsVast.createTemplate') }}
            </AppButton>
        </template>

        <SettingsNotice class="rounded-none border-x-0 border-t-0 p-3" contentClass="text-xs text-foreground/70">
            {{ t('settings.adsVast.infoBanner') }}
        </SettingsNotice>

        <SettingsNotice
            v-if="isFreePlan"
            tone="warning"
            :title="t('settings.adsVast.readOnlyTitle')"
            class="rounded-none border-x-0 border-t-0 p-3"
            contentClass="text-xs text-foreground/70"
        >
            {{ t('settings.adsVast.readOnlyMessage') }}
        </SettingsNotice>

        <SettingsTableSkeleton v-if="isInitialLoading" :columns="5" :rows="4" />

        <div v-else class="border-b border-border mt-4">
            <table class="w-full">
                <thead class="bg-muted/30">
                    <tr>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.adsVast.table.template') }}</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.adsVast.table.format') }}</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.adsVast.table.vastUrl') }}</th>
                        <th class="text-center text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('common.status') }}</th>
                        <th class="text-right text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <template v-if="templates.length > 0">
                        <tr
                            v-for="template in templates"
                            :key="template.id"
                            class="hover:bg-muted/30 transition-all"
                        >
                            <td class="px-6 py-3">
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-medium text-foreground">{{ template.name }}</span>
                                        <span
                                            v-if="template.isDefault"
                                            class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                        >
                                            {{ t('settings.adsVast.defaultBadge') }}
                                        </span>
                                    </div>
                                    <p class="text-xs text-foreground/50 mt-0.5">{{ t('settings.adsVast.createdOn', { date: template.createdAt || '-' }) }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-3">
                                <span :class="['text-xs px-2 py-1 rounded-full font-medium', getAdFormatColor(template.adFormat)]">
                                    {{ getAdFormatLabel(template.adFormat) }}
                                </span>
                                <span v-if="template.adFormat === 'mid-roll' && template.duration" class="text-xs text-foreground/50 ml-2">
                                    ({{ template.duration }}s)
                                </span>
                            </td>
                            <td class="px-6 py-3">
                                <div class="flex items-center gap-2 max-w-[240px]">
                                    <code class="text-xs text-foreground/60 truncate">{{ template.vastUrl }}</code>
                                    <AppButton variant="ghost" size="sm" :disabled="isMutating" @click="copyToClipboard(template.vastUrl)">
                                        <template #icon>
                                            <CheckIcon class="w-4 h-4" />
                                        </template>
                                    </AppButton>
                                </div>
                            </td>
                            <td class="px-6 py-3 text-center">
                                <AppSwitch
                                    :model-value="template.enabled"
                                    :disabled="isFreePlan || saving || deletingId !== null || defaultingId !== null || togglingId === template.id"
                                    @update:model-value="handleToggle(template, $event)"
                                />
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex items-center justify-end gap-2 flex-wrap">
                                    <span
                                        v-if="template.isDefault"
                                        class="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                    >
                                        {{ t('settings.adsVast.actions.default') }}
                                    </span>
                                    <AppButton
                                        v-else
                                        variant="ghost"
                                        size="sm"
                                        :loading="defaultingId === template.id"
                                        :disabled="isFreePlan || saving || deletingId !== null || togglingId !== null || defaultingId !== null || !template.enabled"
                                        @click="handleSetDefault(template)"
                                    >
                                        {{ t('settings.adsVast.actions.setDefault') }}
                                    </AppButton>
                                    <AppButton variant="ghost" size="sm" :disabled="isFreePlan || isMutating" @click="openEditDialog(template)">
                                        <template #icon>
                                            <PencilIcon class="w-4 h-4" />
                                        </template>
                                    </AppButton>
                                    <AppButton variant="ghost" size="sm" :disabled="isFreePlan || isMutating" @click="handleDelete(template)">
                                        <template #icon>
                                            <TrashIcon class="w-4 h-4 text-danger" />
                                        </template>
                                    </AppButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td colspan="5" class="px-6 py-12 text-center">
                            <LinkIcon class="w-10 h-10 text-foreground/30 mb-3 block mx-auto" />
                            <p class="text-sm text-foreground/60 mb-1">{{ t('settings.adsVast.emptyTitle') }}</p>
                            <p class="text-xs text-foreground/40">{{ t('settings.adsVast.emptySubtitle') }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <AppDialog
            :visible="showAddDialog"
            :title="editingTemplate ? t('settings.adsVast.dialog.editTitle') : t('settings.adsVast.dialog.createTitle')"
            maxWidthClass="max-w-lg"
            @update:visible="showAddDialog = $event"
            @close="closeDialog"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="name" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.templateName') }}</label>
                    <AppInput
                        id="name"
                        v-model="formData.name"
                        :disabled="isFreePlan || saving"
                        :placeholder="t('settings.adsVast.dialog.templateNamePlaceholder')"
                    />
                </div>

                <div class="grid gap-2">
                    <label for="vastUrl" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.vastUrlLabel') }}</label>
                    <AppInput
                        id="vastUrl"
                        v-model="formData.vastUrl"
                        :disabled="isFreePlan || saving"
                        :placeholder="t('settings.adsVast.dialog.vastUrlPlaceholder')"
                    />
                </div>

                <div class="grid gap-2">
                    <label class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adFormat') }}</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button
                            v-for="format in adFormatOptions"
                            :key="format"
                            type="button"
                            :disabled="isFreePlan || saving"
                            :class="[
                                'px-3 py-2 border rounded-md text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed',
                                formData.adFormat === format
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border text-foreground/60 hover:border-primary/50'
                            ]"
                            @click="formData.adFormat = format"
                        >
                            {{ getAdFormatLabel(format) }}
                        </button>
                    </div>
                </div>

                <div v-if="formData.adFormat === 'mid-roll'" class="grid gap-2">
                    <label for="duration" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adInterval') }}</label>
                    <AppInput
                        id="duration"
                        v-model.number="formData.duration"
                        :disabled="isFreePlan || saving"
                        type="number"
                        :placeholder="t('settings.adsVast.dialog.adIntervalPlaceholder')"
                        :min="10"
                        :max="600"
                    />
                </div>

                <div class="grid gap-2">
                    <label class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.defaultLabel') }}</label>
                    <label
                        :class="[
                            'flex items-start gap-3 rounded-md border border-border p-3',
                            canMarkAsDefaultInDialog && !saving ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                        ]"
                    >
                        <input
                            v-model="formData.isDefault"
                            type="checkbox"
                            class="mt-1 h-4 w-4 rounded border-border"
                            :disabled="!canMarkAsDefaultInDialog || saving"
                        >
                        <div>
                            <p class="text-sm text-foreground">{{ t('settings.adsVast.dialog.defaultCheckbox') }}</p>
                            <p class="text-xs text-foreground/60 mt-0.5">
                                {{ editingTemplate && !editingTemplate.enabled
                                    ? t('settings.adsVast.dialog.defaultDisabledHint')
                                    : t('settings.adsVast.dialog.defaultHint') }}
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <AppButton variant="secondary" size="sm" :disabled="saving" @click="closeDialog">
                        {{ t('common.cancel') }}
                    </AppButton>
                    <AppButton size="sm" :loading="saving" :disabled="isFreePlan" @click="handleSave">
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        {{ editingTemplate ? t('settings.adsVast.dialog.update') : t('settings.adsVast.dialog.create') }}
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </SettingsSectionCard>
</template>
