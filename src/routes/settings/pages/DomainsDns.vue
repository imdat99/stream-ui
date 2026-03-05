<script setup lang="ts">
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useI18n();

const domains = ref([
    { id: '1', name: 'example.com', addedAt: '2024-01-15' },
    { id: '2', name: 'mysite.org', addedAt: '2024-02-20' },
]);

const newDomain = ref('');
const showAddDialog = ref(false);

const handleAddDomain = () => {
    if (!newDomain.value.trim()) {
        toast.add({
            severity: 'error',
            summary: t('settings.domainsDns.toast.invalidSummary'),
            detail: t('settings.domainsDns.toast.invalidDetail'),
            life: 3000,
        });
        return;
    }

    const exists = domains.value.some(d => d.name === newDomain.value.trim().toLowerCase());
    if (exists) {
        toast.add({
            severity: 'error',
            summary: t('settings.domainsDns.toast.duplicateSummary'),
            detail: t('settings.domainsDns.toast.duplicateDetail'),
            life: 3000,
        });
        return;
    }

    const domainName = newDomain.value.trim().toLowerCase();
    domains.value.push({
        id: Math.random().toString(36).substring(2, 9),
        name: domainName,
        addedAt: new Date().toISOString().split('T')[0],
    });

    newDomain.value = '';
    showAddDialog.value = false;
    toast.add({
        severity: 'success',
        summary: t('settings.domainsDns.toast.addedSummary'),
        detail: t('settings.domainsDns.toast.addedDetail', { domain: domainName }),
        life: 3000,
    });
};

const handleRemoveDomain = (domain: typeof domains.value[0]) => {
    confirm.require({
        message: t('settings.domainsDns.confirm.removeMessage', { domain: domain.name }),
        header: t('settings.domainsDns.confirm.removeHeader'),
        acceptLabel: t('settings.domainsDns.confirm.removeAccept'),
        rejectLabel: t('settings.domainsDns.confirm.removeReject'),
        accept: () => {
            const index = domains.value.findIndex(d => d.id === domain.id);
            if (index !== -1) {
                domains.value.splice(index, 1);
            }
            toast.add({
                severity: 'info',
                summary: t('settings.domainsDns.toast.removedSummary'),
                detail: t('settings.domainsDns.toast.removedDetail', { domain: domain.name }),
                life: 3000,
            });
        },
    });
};

const iframeCode = computed(() => '<iframe src="https://holistream.com/embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>');

const copyIframeCode = () => {
    navigator.clipboard.writeText(iframeCode.value);
    toast.add({
        severity: 'success',
        summary: t('settings.domainsDns.toast.copiedSummary'),
        detail: t('settings.domainsDns.toast.copiedDetail'),
        life: 2000,
    });
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">{{ t('settings.content.domains.title') }}</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    {{ t('settings.content.domains.subtitle') }}
                </p>
            </div>
            <AppButton size="sm" @click="showAddDialog = true">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                {{ t('settings.domainsDns.addDomain') }}
            </AppButton>
        </div>

        <div class="px-6 py-3 bg-info/5 border-b border-info/20">
            <div class="flex items-start gap-2">
                <InfoIcon class="w-4 h-4 text-info mt-0.5" />
                <div class="text-xs text-foreground/70">
                    {{ t('settings.domainsDns.infoBanner') }}
                </div>
            </div>
        </div>

        <div class="border-b border-border">
            <table class="w-full">
                <thead class="bg-muted/30">
                    <tr>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.domainsDns.table.domain') }}</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.domainsDns.table.addedDate') }}</th>
                        <th class="text-right text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr
                        v-for="domain in domains"
                        :key="domain.id"
                        class="hover:bg-muted/30 transition-all"
                    >
                        <td class="px-6 py-3">
                            <div class="flex items-center gap-2">
                                <LinkIcon class="w-4 h-4 text-foreground/40" />
                                <span class="text-sm font-medium text-foreground">{{ domain.name }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-3 text-sm text-foreground/60">{{ domain.addedAt }}</td>
                        <td class="px-6 py-3 text-right">
                            <AppButton variant="ghost" size="sm" @click="handleRemoveDomain(domain)">
                                <template #icon>
                                    <TrashIcon class="w-4 h-4 text-danger" />
                                </template>
                            </AppButton>
                        </td>
                    </tr>
                    <tr v-if="domains.length === 0">
                        <td colspan="3" class="px-6 py-12 text-center">
                            <LinkIcon class="w-10 h-10 text-foreground/30 mb-3 block mx-auto" />
                            <p class="text-sm text-foreground/60 mb-1">{{ t('settings.domainsDns.emptyTitle') }}</p>
                            <p class="text-xs text-foreground/40">{{ t('settings.domainsDns.emptySubtitle') }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="px-6 py-4 bg-muted/30">
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-foreground">{{ t('settings.domainsDns.embedCodeTitle') }}</h4>
                <AppButton variant="secondary" size="sm" @click="copyIframeCode">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.domainsDns.copyCode') }}
                </AppButton>
            </div>
            <p class="text-xs text-foreground/60 mb-2">
                {{ t('settings.domainsDns.embedCodeHint') }}
            </p>
            <pre class="bg-surface border border-border rounded-md p-3 text-xs text-foreground/70 overflow-x-auto"><code>{{ iframeCode }}</code></pre>
        </div>

        <AppDialog
            :visible="showAddDialog"
            @update:visible="showAddDialog = $event"
            :title="t('settings.domainsDns.dialog.title')"
            maxWidthClass="max-w-md"
        >
            <div class="space-y-4">
                <div class="grid gap-2">
                    <label for="domain" class="text-sm font-medium text-foreground">{{ t('settings.domainsDns.dialog.domainLabel') }}</label>
                    <AppInput
                        id="domain"
                        v-model="newDomain"
                        :placeholder="t('settings.domainsDns.dialog.domainPlaceholder')"
                        @enter="handleAddDomain"
                    />
                    <p class="text-xs text-foreground/50">{{ t('settings.domainsDns.dialog.domainHint') }}</p>
                </div>

                <div class="bg-warning/5 border border-warning/20 rounded-md p-3">
                    <div class="flex items-start gap-2">
                        <AlertTriangleIcon class="w-4 h-4 text-warning mt-0.5" />
                        <div class="text-xs text-foreground/70">
                            <p class="font-medium text-foreground mb-1">{{ t('settings.domainsDns.dialog.importantTitle') }}</p>
                            <p>{{ t('settings.domainsDns.dialog.importantDetail') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <AppButton variant="secondary" size="sm" @click="showAddDialog = false">
                    {{ t('common.cancel') }}
                </AppButton>
                <AppButton size="sm" @click="handleAddDomain">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.domainsDns.addDomain') }}
                </AppButton>
            </template>
        </AppDialog>
    </div>
</template>
