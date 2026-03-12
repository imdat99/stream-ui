<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/app/AppButton.vue';
import AppDialog from '@/components/app/AppDialog.vue';
import AppInput from '@/components/app/AppInput.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PlusIcon from '@/components/icons/PlusIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsNotice from '@/routes/settings/components/SettingsNotice.vue';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import SettingsTableSkeleton from '@/routes/settings/components/SettingsTableSkeleton.vue';
import { useQuery } from '@pinia/colada';
import { computed, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

type DomainApiItem = {
    id?: string;
    name?: string;
    created_at?: string;
};

type DomainItem = {
    id: string;
    name: string;
    addedAt: string;
};

const newDomain = ref('');
const showAddDialog = ref(false);
const adding = ref(false);
const removingId = ref<string | null>(null);

const normalizeDomainInput = (value: string) => value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');

const formatDate = (value?: string) => {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value.split('T')[0] || value;
    }

    return date.toISOString().split('T')[0];
};

const mapDomainItem = (item: DomainApiItem): DomainItem => ({
    id: item.id || `${item.name || 'domain'}:${item.created_at || ''}`,
    name: item.name || '',
    addedAt: formatDate(item.created_at),
});

const { data: domainsSnapshot, error, isPending, refetch } = useQuery({
    key: () => ['settings', 'domains'],
    query: async () => {
        const response = await rpcClient.listDomains();
        return (response.domains || []).map(mapDomainItem);
    },
});

const domains = computed(() => domainsSnapshot.value || []);
const isInitialLoading = computed(() => isPending.value && !domainsSnapshot.value);

const iframeCode = computed(() => '<iframe src="https://holistream.com/embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>');

const refetchDomains = () => refetch((fetchError) => {
    throw fetchError;
});

watch(error, (value, previous) => {
    if (!value || value === previous || adding.value || removingId.value !== null) return;

    toast.add({
        severity: 'error',
        summary: t('settings.domainsDns.toast.failedSummary'),
        detail: (value as any)?.message || t('settings.domainsDns.toast.failedDetail'),
        life: 5000,
    });
});

const openAddDialog = () => {
    newDomain.value = '';
    showAddDialog.value = true;
};

const closeAddDialog = () => {
    showAddDialog.value = false;
    newDomain.value = '';
};

const handleAddDomain = async () => {
    if (adding.value) return;

    const domainName = normalizeDomainInput(newDomain.value);
    if (!domainName || !domainName.includes('.') || /[\/\s]/.test(domainName)) {
        toast.add({
            severity: 'error',
            summary: t('settings.domainsDns.toast.invalidSummary'),
            detail: t('settings.domainsDns.toast.invalidDetail'),
            life: 3000,
        });
        return;
    }

    const exists = domains.value.some(domain => domain.name === domainName);
    if (exists) {
        toast.add({
            severity: 'error',
            summary: t('settings.domainsDns.toast.duplicateSummary'),
            detail: t('settings.domainsDns.toast.duplicateDetail'),
            life: 3000,
        });
        return;
    }

    adding.value = true;
    try {
        await rpcClient.createDomain({
            name: domainName,
        });

        await refetchDomains();
        closeAddDialog();
        toast.add({
            severity: 'success',
            summary: t('settings.domainsDns.toast.addedSummary'),
            detail: t('settings.domainsDns.toast.addedDetail', { domain: domainName }),
            life: 3000,
        });
    } catch (e: any) {
        console.error(e);
        const message = String(e?.message || '').toLowerCase();

        if (message.includes('already exists')) {
            toast.add({
                severity: 'error',
                summary: t('settings.domainsDns.toast.duplicateSummary'),
                detail: t('settings.domainsDns.toast.duplicateDetail'),
                life: 3000,
            });
        } else if (message.includes('invalid domain')) {
            toast.add({
                severity: 'error',
                summary: t('settings.domainsDns.toast.invalidSummary'),
                detail: t('settings.domainsDns.toast.invalidDetail'),
                life: 3000,
            });
        } else {
            toast.add({
                severity: 'error',
                summary: t('settings.domainsDns.toast.failedSummary'),
                detail: e.message || t('settings.domainsDns.toast.failedDetail'),
                life: 5000,
            });
        }
    } finally {
        adding.value = false;
    }
};

const handleRemoveDomain = (domain: DomainItem) => {
    confirm.require({
        message: t('settings.domainsDns.confirm.removeMessage', { domain: domain.name }),
        header: t('settings.domainsDns.confirm.removeHeader'),
        acceptLabel: t('settings.domainsDns.confirm.removeAccept'),
        rejectLabel: t('settings.domainsDns.confirm.removeReject'),
        accept: async () => {
            removingId.value = domain.id;
            try {
                await rpcClient.deleteDomain({ id: domain.id });
                await refetchDomains();
                toast.add({
                    severity: 'info',
                    summary: t('settings.domainsDns.toast.removedSummary'),
                    detail: t('settings.domainsDns.toast.removedDetail', { domain: domain.name }),
                    life: 3000,
                });
            } catch (e: any) {
                console.error(e);
                toast.add({
                    severity: 'error',
                    summary: t('settings.domainsDns.toast.failedSummary'),
                    detail: e.message || t('settings.domainsDns.toast.failedDetail'),
                    life: 5000,
                });
            } finally {
                removingId.value = null;
            }
        },
    });
};

const copyIframeCode = async () => {
    try {
        await navigator.clipboard.writeText(iframeCode.value);
    } catch {
        const textArea = document.createElement('textarea');
        textArea.value = iframeCode.value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    toast.add({
        severity: 'success',
        summary: t('settings.domainsDns.toast.copiedSummary'),
        detail: t('settings.domainsDns.toast.copiedDetail'),
        life: 2000,
    });
};
</script>

<template>
    <SettingsSectionCard
        :title="t('settings.content.domains.title')"
        :description="t('settings.content.domains.subtitle')"
        bodyClass=""
    >
        <template #header-actions>
            <AppButton size="sm" :loading="adding" :disabled="isInitialLoading || removingId !== null" @click="openAddDialog">
                <template #icon>
                    <PlusIcon class="w-4 h-4" />
                </template>
                {{ t('settings.domainsDns.addDomain') }}
            </AppButton>
        </template>

        <SettingsNotice class="rounded-none border-x-0 border-t-0 p-3" contentClass="text-xs text-foreground/70">
            {{ t('settings.domainsDns.infoBanner') }}
        </SettingsNotice>

        <SettingsTableSkeleton v-if="isInitialLoading" :columns="3" :rows="4" />

        <div v-else class="border-b border-border mt-4">
            <table class="w-full">
                <thead class="bg-muted/30">
                    <tr>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.domainsDns.table.domain') }}</th>
                        <th class="text-left text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('settings.domainsDns.table.addedDate') }}</th>
                        <th class="text-right text-xs font-medium text-foreground/50 uppercase tracking-wider px-6 py-3">{{ t('common.actions') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <template v-if="domains.length > 0">
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
                                <AppButton
                                    variant="ghost"
                                    size="sm"
                                    :disabled="adding || removingId !== null"
                                    @click="handleRemoveDomain(domain)"
                                >
                                    <template #icon>
                                        <TrashIcon class="w-4 h-4 text-danger" />
                                    </template>
                                </AppButton>
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
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
            :title="t('settings.domainsDns.dialog.title')"
            maxWidthClass="max-w-md"
            @update:visible="showAddDialog = $event"
            @close="closeAddDialog"
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

                <SettingsNotice
                    tone="warning"
                    :title="t('settings.domainsDns.dialog.importantTitle')"
                    class="p-3"
                >
                    <p>{{ t('settings.domainsDns.dialog.importantDetail') }}</p>
                </SettingsNotice>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                <AppButton variant="secondary" size="sm" :disabled="adding" @click="closeAddDialog">
                    {{ t('common.cancel') }}
                </AppButton>
                <AppButton size="sm" :loading="adding" @click="handleAddDomain">
                    <template #icon>
                        <CheckIcon class="w-4 h-4" />
                    </template>
                    {{ t('settings.domainsDns.addDomain') }}
                </AppButton>
                </div>
            </template>
        </AppDialog>
    </SettingsSectionCard>
</template>
