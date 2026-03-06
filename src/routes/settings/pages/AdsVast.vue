<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AppSwitch from '@/components/app/AppSwitch.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

interface VastTemplate {
    id: string;
    name: string;
    vastUrl: string;
    adFormat: 'pre-roll' | 'mid-roll' | 'post-roll';
    duration?: number;
    enabled: boolean;
    createdAt: string;
}

const templates = ref<VastTemplate[]>([
    {
        id: '1',
        name: 'Main Pre-roll Ad',
        vastUrl: 'https://ads.example.com/vast/pre-roll.xml',
        adFormat: 'pre-roll',
        enabled: true,
        createdAt: '2024-01-10',
    },
    {
        id: '2',
        name: 'Mid-roll Ad Break',
        vastUrl: 'https://ads.example.com/vast/mid-roll.xml',
        adFormat: 'mid-roll',
        duration: 30,
        enabled: false,
        createdAt: '2024-02-15',
    },
]);

const adFormatOptions = ['pre-roll', 'mid-roll', 'post-roll'] as const;

const showAddDialog = ref(false);
const editingTemplate = ref<VastTemplate | null>(null);

const formData = ref({
    name: '',
    vastUrl: '',
    adFormat: 'pre-roll' as 'pre-roll' | 'mid-roll' | 'post-roll',
    duration: undefined as number | undefined,
});

const resetForm = () => {
    formData.value = {
        name: '',
        vastUrl: '',
        adFormat: 'pre-roll',
        duration: undefined,
    };
    editingTemplate.value = null;
};

const openAddDialog = () => {
    resetForm();
    showAddDialog.value = true;
};

const openEditDialog = (template: VastTemplate) => {
    formData.value = {
        name: template.name,
        vastUrl: template.vastUrl,
        adFormat: template.adFormat,
        duration: template.duration,
    };
    editingTemplate.value = template;
    showAddDialog.value = true;
};

const handleSave = () => {
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
    if (formData.value.adFormat === 'mid-roll' && !formData.value.duration) {
        toast.add({
            severity: 'error',
            summary: t('settings.adsVast.toast.durationRequiredSummary'),
            detail: t('settings.adsVast.toast.durationRequiredDetail'),
            life: 3000,
        });
        return;
    }

    if (editingTemplate.value) {
        const index = templates.value.findIndex(template => template.id === editingTemplate.value!.id);
        if (index !== -1) {
            templates.value[index] = { ...templates.value[index], ...formData.value };
        }
        toast.add({
            severity: 'success',
            summary: t('settings.adsVast.toast.updatedSummary'),
            detail: t('settings.adsVast.toast.updatedDetail'),
            life: 3000,
        });
    } else {
        templates.value.push({
            id: Math.random().toString(36).substring(2, 9),
            ...formData.value,
            enabled: true,
            createdAt: new Date().toISOString().split('T')[0],
        });
        toast.add({
            severity: 'success',
            summary: t('settings.adsVast.toast.createdSummary'),
            detail: t('settings.adsVast.toast.createdDetail'),
            life: 3000,
        });
    }

    showAddDialog.value = false;
    resetForm();
};

const handleToggle = (template: VastTemplate) => {
    template.enabled = !template.enabled;
    toast.add({
        severity: 'info',
        summary: template.enabled
            ? t('settings.adsVast.toast.enabledSummary')
            : t('settings.adsVast.toast.disabledSummary'),
        detail: t('settings.adsVast.toast.toggleDetail', {
            name: template.name,
            state: template.enabled
                ? t('settings.adsVast.state.enabled')
                : t('settings.adsVast.state.disabled'),
        }),
        life: 2000,
    });
};

const handleDelete = (template: VastTemplate) => {
    confirm.require({
        message: t('settings.adsVast.confirm.deleteMessage', { name: template.name }),
        header: t('settings.adsVast.confirm.deleteHeader'),
        acceptLabel: t('settings.adsVast.confirm.deleteAccept'),
        rejectLabel: t('settings.adsVast.confirm.deleteReject'),
        accept: () => {
            const index = templates.value.findIndex(item => item.id === template.id);
            if (index !== -1) templates.value.splice(index, 1);
            toast.add({
                severity: 'info',
                summary: t('settings.adsVast.toast.deletedSummary'),
                detail: t('settings.adsVast.toast.deletedDetail'),
                life: 3000,
            });
        },
    });
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">{{ t('settings.content.ads.title') }}</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    {{ t('settings.content.ads.subtitle') }}
                </p>
            </div>
            <AppButton size="sm" @click="openAddDialog">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                {{ t('settings.adsVast.createTemplate') }}
            </AppButton>
        </div>

        <div class="px-6 py-3 bg-info/5 border-b border-info/20">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-info mt-0.5" />
                <div class="text-xs text-foreground/70">
                    {{ t('settings.adsVast.infoBanner') }}
                </div>
            </div>
        </div>

        <div class="border-b border-border">
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
                    <tr
                        v-for="template in templates"
                        :key="template.id"
                        class="hover:bg-muted/30 transition-all"
                    >
                        <td class="px-6 py-3">
                            <div>
                                <span class="text-sm font-medium text-foreground">{{ template.name }}</span>
                                <p class="text-xs text-foreground/50 mt-0.5">{{ t('settings.adsVast.createdOn', { date: template.createdAt }) }}</p>
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
                            <div class="flex items-center gap-2 max-w-[200px]">
                                <code class="text-xs text-foreground/60 truncate">{{ template.vastUrl }}</code>
                                <AppButton variant="ghost" size="sm" @click="copyToClipboard(template.vastUrl)">
                                    <template #icon>
                                        <CheckIcon class="w-4 h-4" />
                                    </template>
                                </AppButton>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <AppSwitch
                                :model-value="template.enabled"
                                @update:model-value="handleToggle(template)"
                            />
                        </td>
                        <td class="px-6 py-3 text-right">
                            <div class="flex items-center justify-end gap-1">
                                <AppButton variant="ghost" size="sm" @click="openEditDialog(template)">
                                    <template #icon>
                                        <PencilIcon class="w-4 h-4" />
                                    </template>
                                </AppButton>
                                <AppButton variant="ghost" size="sm" @click="handleDelete(template)">
                                    <template #icon>
                                        <TrashIcon class="w-4 h-4 text-danger" />
                                    </template>
                                </AppButton>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="templates.length === 0">
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
            @update:visible="showAddDialog = $event"
            :title="editingTemplate ? t('settings.adsVast.dialog.editTitle') : t('settings.adsVast.dialog.createTitle')"
            maxWidthClass="max-w-lg"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="name" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.templateName') }}</label>
                    <AppInput
                        id="name"
                        v-model="formData.name"
                        :placeholder="t('settings.adsVast.dialog.templateNamePlaceholder')"
                    />
                </div>

                <div class="grid gap-2">
                    <label for="vastUrl" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.vastUrlLabel') }}</label>
                    <AppInput
                        id="vastUrl"
                        v-model="formData.vastUrl"
                        :placeholder="t('settings.adsVast.dialog.vastUrlPlaceholder')"
                    />
                </div>

                <div class="grid gap-2">
                    <label class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adFormat') }}</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button
                            v-for="format in adFormatOptions"
                            :key="format"
                            @click="formData.adFormat = format"
                            :class="[
                                'px-3 py-2 border rounded-md text-sm font-medium transition-all',
                                formData.adFormat === format
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border text-foreground/60 hover:border-primary/50'
                            ]">
                            {{ getAdFormatLabel(format) }}
                        </button>
                    </div>
                </div>

                <div v-if="formData.adFormat === 'mid-roll'" class="grid gap-2">
                    <label for="duration" class="text-sm font-medium text-foreground">{{ t('settings.adsVast.dialog.adInterval') }}</label>
                    <AppInput
                        id="duration"
                        v-model.number="formData.duration"
                        type="number"
                        :placeholder="t('settings.adsVast.dialog.adIntervalPlaceholder')"
                        :min="10"
                        :max="600"
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <AppButton variant="secondary" size="sm" @click="showAddDialog = false">
                        {{ t('common.cancel') }}
                    </AppButton>
                    <AppButton size="sm" @click="handleSave">
                        <template #icon>
                            <CheckIcon class="w-4 h-4" />
                        </template>
                        {{ editingTemplate ? t('settings.adsVast.dialog.update') : t('settings.adsVast.dialog.create') }}
                    </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
