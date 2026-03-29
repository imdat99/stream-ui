<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsSectionCard from '@/routes/settings/components/SettingsSectionCard.vue';
import { useQuery } from '@pinia/colada';
import { useTranslation } from 'i18next-vue';
import { computed, ref, watch } from 'vue';
import DomainsDnsDialog from './components/DomainsDnsDialog.vue';
import DomainsDnsEmbedCode from './components/DomainsDnsEmbedCode.vue';
import DomainsDnsNotices from './components/DomainsDnsNotices.vue';
import DomainsDnsTable from './components/DomainsDnsTable.vue';
import DomainsDnsToolbar from './components/DomainsDnsToolbar.vue';
import { normalizeDomainInput } from './helpers';
import type { Domain } from '@/server/api/proto/app/v1/common';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

const newDomain = ref('');
const showAddDialog = ref(false);
const adding = ref(false);
const removingId = ref<string | null>(null);

const { data: domainsSnapshot, error, isPending, refetch } = useQuery({
  key: () => ['settings', 'domains'],
  query: async () => {
    const response = await rpcClient.listDomains();
    return (response.domains || []);
  },
});

const domains = computed(() => domainsSnapshot.value || []);
const isInitialLoading = computed(() => isPending.value && !domainsSnapshot.value);
const iframeCode = computed(() => '<iframe src="https://holistream.com/embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>');

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
  if (!domainName || !domainName.includes('.') || /[/\s]/.test(domainName)) {
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

    await refetch();
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

const handleRemoveDomain = (domain: Domain) => {
  confirm.require({
    message: t('settings.domainsDns.confirm.removeMessage', { domain: domain.name }),
    header: t('settings.domainsDns.confirm.removeHeader'),
    acceptLabel: t('settings.domainsDns.confirm.removeAccept'),
    rejectLabel: t('settings.domainsDns.confirm.removeReject'),
    accept: async () => {
      removingId.value = domain.id!;
      try {
        await rpcClient.deleteDomain({ id: domain.id! });
        await refetch();
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
      <DomainsDnsToolbar
        :loading="adding"
        :disabled="isInitialLoading || removingId !== null"
        @create="openAddDialog"
      />
    </template>

    <DomainsDnsNotices />

    <DomainsDnsTable
      :domains="domains"
      :is-initial-loading="isInitialLoading"
      :adding="adding"
      :removing-id="removingId"
      @remove="handleRemoveDomain"
    />

    <DomainsDnsEmbedCode :code="iframeCode" @copy="copyIframeCode" />

    <DomainsDnsDialog
      :visible="showAddDialog"
      :domain="newDomain"
      :adding="adding"
      @update:visible="showAddDialog = $event"
      @update:domain="newDomain = $event"
      @submit="handleAddDomain"
      @close="closeAddDialog"
    />
  </SettingsSectionCard>
</template>
