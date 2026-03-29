<script setup lang="ts">
import { client as rpcClient } from '@/api/rpcclient';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AdminInput from './components/AdminInput.vue';
import AdminSelect from './components/AdminSelect.vue';
import AdminTable from './components/AdminTable.vue';
import AdminSectionCard from './components/AdminSectionCard.vue';
import type { ColumnDef } from '@tanstack/vue-table';
import { computed, h, onMounted, reactive, ref } from 'vue';
import AdminMetricCard from './components/AdminMetricCard.vue';
import AdminPlaceholderTable from './components/AdminPlaceholderTable.vue';
import AdminSectionShell from './components/AdminSectionShell.vue';
import { useAdminPageHeader } from './components/useAdminPageHeader';

type ListPopupAdsResponse = Awaited<ReturnType<typeof rpcClient.listAdminPopupAds>>;
type AdminPopupAdRow = NonNullable<ListPopupAdsResponse['items']>[number];

const popupTypes = ['url', 'script'] as const;
const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPopupAdRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const search = ref('');
const appliedSearch = ref('');
const ownerFilter = ref('');
const appliedOwnerFilter = ref('');
const selectedRow = ref<AdminPopupAdRow | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

const createForm = reactive({ userId: '', type: 'url', label: '', value: '', isActive: true, maxTriggersPerSession: 3 });
const editForm = reactive({ id: '', userId: '', type: 'url', label: '', value: '', isActive: true, maxTriggersPerSession: 3 });

const canCreate = computed(() => createForm.userId.trim() && createForm.label.trim() && createForm.value.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.userId.trim() && editForm.label.trim() && editForm.value.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const summary = computed(() => [
  { label: 'Visible records', value: rows.value.length },
  { label: 'Active', value: rows.value.filter((row) => row.isActive).length },
  { label: 'URL type', value: rows.value.filter((row) => row.type === 'url').length },
  { label: 'Script type', value: rows.value.filter((row) => row.type === 'script').length },
]);

const loadPopupAds = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPopupAds({ page: page.value, limit: limit.value, userId: appliedOwnerFilter.value.trim() || undefined, search: appliedSearch.value.trim() || undefined });
    rows.value = response.items ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
  } catch (err: any) {
    error.value = err?.message || 'Failed to load admin popup ads';
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  page.value = 1;
  appliedSearch.value = search.value;
  appliedOwnerFilter.value = ownerFilter.value;
  await loadPopupAds();
};

const resetCreateForm = () => {
  createForm.userId = '';
  createForm.type = 'url';
  createForm.label = '';
  createForm.value = '';
  createForm.isActive = true;
  createForm.maxTriggersPerSession = 3;
};

const openEditDialog = (row: AdminPopupAdRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || '';
  editForm.userId = row.userId || '';
  editForm.type = (row.type as 'url' | 'script') || 'url';
  editForm.label = row.label || '';
  editForm.value = row.value || '';
  editForm.isActive = !!row.isActive;
  editForm.maxTriggersPerSession = Number(row.maxTriggersPerSession || 3);
  editOpen.value = true;
};

const openDeleteDialog = (row: AdminPopupAdRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminPopupAd({
      userId: createForm.userId.trim(),
      type: createForm.type,
      label: createForm.label.trim(),
      value: createForm.value.trim(),
      isActive: createForm.isActive,
      maxTriggersPerSession: createForm.type === 'url' ? createForm.maxTriggersPerSession : undefined,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadPopupAds();
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to create popup ad';
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminPopupAd({
      id: editForm.id,
      userId: editForm.userId.trim(),
      type: editForm.type,
      label: editForm.label.trim(),
      value: editForm.value.trim(),
      isActive: editForm.isActive,
      maxTriggersPerSession: editForm.type === 'url' ? editForm.maxTriggersPerSession : undefined,
    });
    editOpen.value = false;
    await loadPopupAds();
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to update popup ad';
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminPopupAd({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadPopupAds();
  } catch (err: any) {
    actionError.value = err?.message || 'Failed to delete popup ad';
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadPopupAds();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadPopupAds();
};

const columns = computed<ColumnDef<AdminPopupAdRow>[]>(() => [
  {
    id: 'label',
    header: 'Popup',
    accessorFn: row => row.label || '',
    cell: ({ row }) => h('div', { class: 'text-left' }, [
      h('div', { class: 'font-medium text-foreground' }, row.original.label),
      h('div', { class: 'mt-1 text-xs text-foreground/60' }, row.original.ownerEmail || row.original.userId || 'No owner'),
    ]),
    meta: { headerClass: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3' },
  },
  {
    id: 'type',
    header: 'Type',
    accessorFn: row => row.type || '',
    meta: { headerClass: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3 text-foreground/70' },
  },
  {
    id: 'value',
    header: 'Value',
    accessorFn: row => row.value || '',
    cell: ({ row }) => h('code', { class: 'block max-w-[360px] truncate text-xs text-foreground/60' }, row.original.value || '—'),
    meta: { headerClass: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3' },
  },
  {
    id: 'maxTriggersPerSession',
    header: 'Max triggers/session',
    accessorFn: row => row.maxTriggersPerSession || 0,
    meta: { headerClass: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3 text-foreground/70' },
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => row.isActive ? 'ACTIVE' : 'INACTIVE',
    cell: ({ row }) => h('span', { class: 'text-foreground/70' }, row.original.isActive ? 'ACTIVE' : 'INACTIVE'),
    meta: { headerClass: 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3' },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => h('div', { class: 'flex justify-end gap-2' }, [
      h(AppButton, { size: 'sm', variant: 'secondary', onClick: () => openEditDialog(row.original) }, { default: () => 'Edit' }),
      h(AppButton, { size: 'sm', variant: 'danger', onClick: () => openDeleteDialog(row.original) }, { default: () => 'Delete' }),
    ]),
    meta: { headerClass: 'px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50', cellClass: 'px-4 py-3 text-right' },
  },
]);

useAdminPageHeader(() => ({
  eyebrow: 'Advertising',
  badge: loading.value ? 'Syncing popup inventory' : `${total.value} total popups`,
  actions: [
    { label: 'Refresh', variant: 'secondary', loading: loading.value, onClick: loadPopupAds },
    { label: 'Create popup', onClick: () => { actionError.value = null; createOpen.value = true; } },
  ],
}));

onMounted(loadPopupAds);
</script>

<template>
  <AdminSectionShell>
    <template #stats>
      <AdminMetricCard v-for="item in summary" :key="item.label" :label="item.label" :value="item.value" />
    </template>

    <div class="space-y-4">
      <AdminSectionCard title="Filters" description="Search popup ads by label and narrow by owner reference if needed." bodyClass="p-5">
        <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-end">
          <div class="space-y-2"><label class="text-xs font-medium text-foreground/60">Search</label><AdminInput v-model="search" placeholder="Search popup label" @enter="applyFilters" /></div>
          <div class="space-y-2"><label class="text-xs font-medium text-foreground/60">Owner reference</label><AdminInput v-model="ownerFilter" placeholder="Optional owner reference" @enter="applyFilters" /></div>
          <div class="flex items-center gap-2 xl:justify-end"><AppButton size="sm" variant="ghost" @click="search = ''; ownerFilter = ''; appliedSearch = ''; appliedOwnerFilter = ''; loadPopupAds()">Reset</AppButton><AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton></div>
        </div>
      </AdminSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <AdminSectionCard v-else title="Popup Ads" description="Popup ad inventory across users." bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="6" :rows="4" />
        <AdminTable v-else :data="rows" :columns="columns" :get-row-id="(row) => row.id || row.label || ''" wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent" tableClass="w-full" headerRowClass="bg-muted/30" bodyRowClass="border-b border-border hover:bg-muted/30">
          <template #empty>
            <div class="px-6 py-12 text-center"><p class="mb-1 text-sm text-foreground/60">No popup ads matched the current filters.</p><p class="text-xs text-foreground/40">Try a broader label or clear the owner filter.</p></div>
          </template>
        </AdminTable>
        <div class="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div class="text-xs text-foreground/55">Page {{ page }} of {{ totalPages }} · {{ total }} records</div>
          <div class="flex items-center gap-2"><AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton><AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton></div>
        </div>
      </AdminSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create popup ad" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Owner user ID</label><AdminInput v-model="createForm.userId" placeholder="user-id" /></div>
        <div class="space-y-2"><label class="text-sm font-medium text-foreground/70">Type</label><AdminSelect v-model="createForm.type"><option v-for="type in popupTypes" :key="type" :value="type">{{ type }}</option></AdminSelect></div>
        <div v-if="createForm.type === 'url'" class="space-y-2"><label class="text-sm font-medium text-foreground/70">Max triggers / session</label><AdminInput v-model="createForm.maxTriggersPerSession" type="number" min="1" /></div>
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Label</label><AdminInput v-model="createForm.label" placeholder="Homepage campaign" /></div>
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Value</label><AdminInput v-if="createForm.type === 'url'" v-model="createForm.value" placeholder="https://..." /><textarea v-else v-model="createForm.value" rows="4" class="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" placeholder="<script async src='//example.com/ad.js'></script>" /></div>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.isActive" type="checkbox" class="h-4 w-4" />Active</label>
      </div>
    </div>
    <template #footer><div class="flex justify-end gap-2"><AppButton variant="secondary" size="sm" :disabled="submitting" @click="createOpen = false">Cancel</AppButton><AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton></div></template>
  </AppDialog>

  <AppDialog v-model:visible="editOpen" title="Edit popup ad" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Owner user ID</label><AdminInput v-model="editForm.userId" /></div>
        <div class="space-y-2"><label class="text-sm font-medium text-foreground/70">Type</label><AdminSelect v-model="editForm.type"><option v-for="type in popupTypes" :key="type" :value="type">{{ type }}</option></AdminSelect></div>
        <div v-if="editForm.type === 'url'" class="space-y-2"><label class="text-sm font-medium text-foreground/70">Max triggers / session</label><AdminInput v-model="editForm.maxTriggersPerSession" type="number" min="1" /></div>
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Label</label><AdminInput v-model="editForm.label" /></div>
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium text-foreground/70">Value</label><AdminInput v-if="editForm.type === 'url'" v-model="editForm.value" /><textarea v-else v-model="editForm.value" rows="4" class="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm" /></div>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.isActive" type="checkbox" class="h-4 w-4" />Active</label>
      </div>
    </div>
    <template #footer><div class="flex justify-end gap-2"><AppButton variant="secondary" size="sm" :disabled="submitting" @click="editOpen = false">Cancel</AppButton><AppButton size="sm" :loading="submitting" :disabled="!canUpdate" @click="submitEdit">Save</AppButton></div></template>
  </AppDialog>

  <AppDialog v-model:visible="deleteOpen" title="Delete popup ad" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-foreground/70">Delete popup ad <span class="font-medium">{{ selectedRow?.label || 'this popup' }}</span>.</p>
    </div>
    <template #footer><div class="flex justify-end gap-2"><AppButton variant="secondary" size="sm" :disabled="submitting" @click="deleteOpen = false">Cancel</AppButton><AppButton variant="danger" size="sm" :loading="submitting" @click="submitDelete">Delete</AppButton></div></template>
  </AppDialog>
</template>
