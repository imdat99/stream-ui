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
import { ref } from 'vue';

const toast = useAppToast();
const confirm = useAppConfirm();

// VAST Templates
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
        toast.add({ severity: 'error', summary: 'Name Required', detail: 'Please enter a template name.', life: 3000 });
        return;
    }
    if (!formData.value.vastUrl.trim()) {
        toast.add({ severity: 'error', summary: 'VAST URL Required', detail: 'Please enter the VAST tag URL.', life: 3000 });
        return;
    }
    try {
        new URL(formData.value.vastUrl);
    } catch {
        toast.add({ severity: 'error', summary: 'Invalid URL', detail: 'Please enter a valid URL.', life: 3000 });
        return;
    }
    if (formData.value.adFormat === 'mid-roll' && !formData.value.duration) {
        toast.add({ severity: 'error', summary: 'Duration Required', detail: 'Mid-roll ads require a duration/interval.', life: 3000 });
        return;
    }

    if (editingTemplate.value) {
        const index = templates.value.findIndex(t => t.id === editingTemplate.value!.id);
        if (index !== -1) {
            templates.value[index] = { ...templates.value[index], ...formData.value };
        }
        toast.add({ severity: 'success', summary: 'Template Updated', detail: 'VAST template has been updated.', life: 3000 });
    } else {
        templates.value.push({
            id: Math.random().toString(36).substring(2, 9),
            ...formData.value,
            enabled: true,
            createdAt: new Date().toISOString().split('T')[0],
        });
        toast.add({ severity: 'success', summary: 'Template Created', detail: 'VAST template has been created.', life: 3000 });
    }

    showAddDialog.value = false;
    resetForm();
};

const handleToggle = (template: VastTemplate) => {
    template.enabled = !template.enabled;
    toast.add({
        severity: 'info',
        summary: template.enabled ? 'Template Enabled' : 'Template Disabled',
        detail: `${template.name} has been ${template.enabled ? 'enabled' : 'disabled'}.`,
        life: 2000
    });
};

const handleDelete = (template: VastTemplate) => {
    confirm.require({
        message: `Are you sure you want to delete "${template.name}"?`,
        header: 'Delete Template',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: () => {
            const index = templates.value.findIndex(t => t.id === template.id);
            if (index !== -1) templates.value.splice(index, 1);
            toast.add({ severity: 'info', summary: 'Template Deleted', detail: 'VAST template has been removed.', life: 3000 });
        }
    });
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.add({ severity: 'success', summary: 'Copied', detail: 'URL copied to clipboard.', life: 2000 });
};

const getAdFormatLabel = (format: string) => {
    const labels: Record<string, string> = {
        'pre-roll': 'Pre-roll',
        'mid-roll': 'Mid-roll',
        'post-roll': 'Post-roll',
    };
    return labels[format] || format;
};

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
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">Ads & VAST</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    Create and manage VAST ad templates for your videos.
                </p>
            </div>
            <AppButton size="sm" @click="openAddDialog">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                Create Template
            </AppButton>
        </div>

        <!-- Info Banner -->
        <div class="px-6 py-3 bg-info/5 border-b border-info/20">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-info mt-0.5" />
                <div class="text-xs text-foreground/70">
                    VAST (Video Ad Serving Template) is an XML schema for serving ad tags to video players.
                </div>
            </div>
        </div>

        <!-- Templates Table -->
        <div class="border-b border-border">
            <table class="w-full">
                <thead class="bg-muted/30">
                    <tr>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Template</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Format</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">VAST URL</th>
                        <th class="text-center text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Status</th>
                        <th class="text-right text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">Actions</th>
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
                                <p class="text-xs text-foreground/50 mt-0.5">Created {{ template.createdAt }}</p>
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
                            <p class="text-sm text-foreground/60 mb-1">No VAST templates yet</p>
                            <p class="text-xs text-foreground/40">Create a template to start monetizing your videos</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add/Edit Dialog -->
        <AppDialog
            :visible="showAddDialog"
            @update:visible="showAddDialog = $event"
            :title="editingTemplate ? 'Edit Template' : 'Create VAST Template'"
            maxWidthClass="max-w-lg"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="name" class="text-sm font-medium text-foreground">Template Name</label>
                    <AppInput
                        id="name"
                        v-model="formData.name"
                        placeholder="e.g., Main Pre-roll Ad"
                    />
                </div>

                <div class="grid gap-2">
                    <label for="vastUrl" class="text-sm font-medium text-foreground">VAST Tag URL</label>
                    <AppInput
                        id="vastUrl"
                        v-model="formData.vastUrl"
                        placeholder="https://ads.example.com/vast/tag.xml"
                    />
                </div>

                <div class="grid gap-2">
                    <label class="text-sm font-medium text-foreground">Ad Format</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button
                            v-for="format in ['pre-roll', 'mid-roll', 'post-roll']"
                            :key="format"
                            @click="formData.adFormat = format as any"
                            :class="[
                                'px-3 py-2 border rounded-md text-sm font-medium capitalize transition-all',
                                formData.adFormat === format
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border text-foreground/60 hover:border-primary/50'
                            ]">
                            {{ format }}
                        </button>
                    </div>
                </div>

                <div v-if="formData.adFormat === 'mid-roll'" class="grid gap-2">
                    <label for="duration" class="text-sm font-medium text-foreground">Ad Interval (seconds)</label>
                    <AppInput
                        id="duration"
                        v-model.number="formData.duration"
                        type="number"
                        placeholder="30"
                        :min="10"
                        :max="600"
                    />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                <AppButton variant="secondary" size="sm" @click="showAddDialog = false">
                    Cancel
                </AppButton>
                <AppButton size="sm" @click="handleSave">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ editingTemplate ? 'Update' : 'Create' }}
                </AppButton>
                </div>
            </template>
        </AppDialog>
    </div>
</template>
