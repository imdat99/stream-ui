<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import { useAppConfirm } from '@/composables/useAppConfirm';
import { useAppToast } from '@/composables/useAppToast';
import SettingsSectionCard from '../components/SettingsSectionCard.vue';
import PopupAdsDialog from './components/PopupAdsDialog.vue';
import PopupAdsTable from './components/PopupAdsTable';
import PopupAdsToolbar from './components/PopupAdsToolbar.vue';
import type { PopupAdFormData, PopupAdItem } from './types';
import { useQuery } from '@pinia/colada';
import { computed, watch, ref } from 'vue';
import { useTranslation } from 'i18next-vue';

const toast = useAppToast();
const confirm = useAppConfirm();
const { t } = useTranslation();

const showDialog = ref(false);
const saving = ref(false);
const deletingId = ref<string | null>(null);
const togglingId = ref<string | null>(null);
const editingItem = ref<PopupAdItem | null>(null);

const createInitialFormData = (): PopupAdFormData => ({
  type: 'url',
  label: '',
  value: '',
  isActive: true,
  maxTriggersPerSession: 3,
});

const formData = ref<PopupAdFormData>(createInitialFormData());

const pageSizeOptions = [5, 10, 20, 50] as const;
const page = ref(1);
const limit = ref(10);

const { data: popupSnapshot, error, isPending, refetch } = useQuery({
  key: () => ['settings', 'popup-ads', page.value, limit.value],
  query: async () => {
    return await rpcClient.listPopupAds({ page: page.value, limit: limit.value });
  },
});

const items = computed<PopupAdItem[]>(() => popupSnapshot.value?.items || []);
const total = computed(() => popupSnapshot.value?.total || 0);
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const hasPrev = computed(() => page.value > 1);
const hasNext = computed(() => page.value < totalPages.value);
const isMutating = computed(() => saving.value || deletingId.value !== null || togglingId.value !== null);
const isInitialLoading = computed(() => isPending.value && !popupSnapshot.value);

const getErrorMessage = (value: any, fallback: string) => value?.error?.message || value?.message || value?.data?.message || fallback;
const showActionErrorToast = (value: any) => {
  toast.add({ severity: 'error', summary: t('settings.popupAds.toast.failedSummary'), detail: getErrorMessage(value, t('settings.popupAds.toast.failedDetail')), life: 5000 });
};

watch(error, (value, previous) => {
  if (!value || value === previous || isMutating.value) return;
  showActionErrorToast(value);
});

const resetForm = () => {
  formData.value = createInitialFormData();
  editingItem.value = null;
};

const closeDialog = () => {
  showDialog.value = false;
  resetForm();
};

const openCreateDialog = () => {
  resetForm();
  showDialog.value = true;
};

const openEditDialog = (item: PopupAdItem) => {
  editingItem.value = item;
  formData.value = {
    type: (item.type as 'url' | 'script') || 'url',
    label: item.label || '',
    value: item.value || '',
    isActive: Boolean(item.isActive),
    maxTriggersPerSession: Number(item.maxTriggersPerSession || 3),
  };
  showDialog.value = true;
};

const handleSave = async () => {
  if (saving.value) return;

  const label = formData.value.label.trim();
  const value = formData.value.value.trim();

  if (!label) {
    toast.add({ severity: 'error', summary: t('settings.popupAds.toast.labelRequiredSummary'), detail: t('settings.popupAds.toast.labelRequiredDetail'), life: 3000 });
    return;
  }
  if (!value) {
    toast.add({ severity: 'error', summary: t('settings.popupAds.toast.valueRequiredSummary'), detail: t('settings.popupAds.toast.valueRequiredDetail'), life: 3000 });
    return;
  }
  if (formData.value.type === 'url') {
    try {
      new URL(value);
    } catch {
      toast.add({ severity: 'error', summary: t('settings.popupAds.toast.invalidUrlSummary'), detail: t('settings.popupAds.toast.invalidUrlDetail'), life: 3000 });
      return;
    }
  }
  if (formData.value.type === 'url' && formData.value.maxTriggersPerSession < 1) {
    toast.add({ severity: 'error', summary: t('settings.popupAds.toast.maxTriggersRequiredSummary'), detail: t('settings.popupAds.toast.maxTriggersRequiredDetail'), life: 3000 });
    return;
  }

  saving.value = true;
  try {
    const payload = {
      type: formData.value.type,
      label,
      value,
      isActive: formData.value.isActive,
      maxTriggersPerSession: formData.value.type === 'url' ? formData.value.maxTriggersPerSession : undefined,
    };

    if (editingItem.value?.id) {
      await rpcClient.updatePopupAd({ id: editingItem.value.id, ...payload });
      toast.add({ severity: 'success', summary: t('settings.popupAds.toast.updatedSummary'), detail: t('settings.popupAds.toast.updatedDetail'), life: 2500 });
    } else {
      await rpcClient.createPopupAd(payload);
      toast.add({ severity: 'success', summary: t('settings.popupAds.toast.createdSummary'), detail: t('settings.popupAds.toast.createdDetail'), life: 2500 });
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

const handleDelete = (item: PopupAdItem) => {
  confirm.require({
    message: t('settings.popupAds.confirm.deleteMessage', { name: item.label || '' }),
    header: t('settings.popupAds.confirm.deleteHeader'),
    acceptLabel: t('settings.popupAds.confirm.deleteAccept'),
    rejectLabel: t('settings.popupAds.confirm.deleteReject'),
    accept: async () => {
      deletingId.value = item.id || null;
      try {
        await rpcClient.deletePopupAd({ id: item.id || '' });
        await refetch();
        toast.add({ severity: 'info', summary: t('settings.popupAds.toast.deletedSummary'), detail: t('settings.popupAds.toast.deletedDetail'), life: 2500 });
      } catch (value: any) {
        console.error(value);
        showActionErrorToast(value);
      } finally {
        deletingId.value = null;
      }
    },
  });
};

const handleToggleActive = async ({ item, value }: { item: PopupAdItem; value: boolean }) => {
  togglingId.value = item.id || null;
  try {
    await rpcClient.updatePopupAd({
      id: item.id || '',
      type: item.type || 'url',
      label: item.label || '',
      value: item.value || '',
      isActive: value,
      maxTriggersPerSession: item.type === 'url' ? item.maxTriggersPerSession : undefined,
    });
    await refetch();
  } catch (value: any) {
    console.error(value);
    showActionErrorToast(value);
  } finally {
    togglingId.value = null;
  }
};

const previousPage = () => {
  if (!hasPrev.value || isInitialLoading.value) return;
  page.value -= 1;
};

const nextPage = () => {
  if (!hasNext.value || isInitialLoading.value) return;
  page.value += 1;
};

const changePageSize = (value: number) => {
  const nextLimit = Number(value) || 10;
  if (nextLimit === limit.value) return;
  limit.value = nextLimit;
  page.value = 1;
};
</script>

<template>
  <SettingsSectionCard :title="t('settings.content.popupAds.title')" :description="t('settings.content.popupAds.subtitle')" bodyClass="">
    <template #header-actions>
      <PopupAdsToolbar :disabled="isInitialLoading || isMutating" @create="openCreateDialog" />
    </template>

    <PopupAdsTable
      :items="items"
      :disabled="isMutating"
      :is-loading="isInitialLoading"
      :current-page="page"
      :total-pages="totalPages"
      :total-records="total"
      :rows-per-page="limit"
      :page-size-options="pageSizeOptions as unknown as number[]"
      :can-previous-page="hasPrev"
      :can-next-page="hasNext"
      @edit="openEditDialog"
      @delete="handleDelete"
      @toggle-active="handleToggleActive"
      @previous-page="previousPage"
      @next-page="nextPage"
      @page-size-change="changePageSize"
    />

    <div class="px-4 py-3 bg-header">
      <p class="text-xs leading-5 text-foreground/60">
        <strong class="text-foreground/80">{{ t('settings.popupAds.info.urlTitle') }}</strong>
        {{ t('settings.popupAds.info.urlDescription') }}
        <br>
        <strong class="text-foreground/80">{{ t('settings.popupAds.info.scriptTitle') }}</strong>
        {{ t('settings.popupAds.info.scriptDescription') }}
      </p>
    </div>

    <PopupAdsDialog :visible="showDialog" :editing-item="editingItem" :form-data="formData" :saving="saving" @update:visible="showDialog = $event" @update:form-data="formData = $event" @save="handleSave" @close="closeDialog" />
  </SettingsSectionCard>
</template>
