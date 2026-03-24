<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AdminInput from "./components/AdminInput.vue";
import AdminTextarea from "./components/AdminTextarea.vue";
import AdminTable from "./components/AdminTable.vue";
import AdminSectionCard from "./components/AdminSectionCard.vue";
import { type ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref } from "vue";
import AdminMetricCard from "./components/AdminMetricCard.vue";
import AdminPlaceholderTable from "./components/AdminPlaceholderTable.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type ListConfigsResponse = Awaited<ReturnType<typeof rpcClient.listAdminPlayerConfigs>>;
type AdminPlayerConfigRow = NonNullable<ListConfigsResponse["configs"]>[number];

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPlayerConfigRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminPlayerConfigRow | null>(null);
const search = ref("");
const appliedSearch = ref("");
const ownerFilter = ref("");
const appliedOwnerFilter = ref("");
const createOpen = ref(false);
const detailOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

const createForm = reactive({
  userId: "",
  name: "",
  description: "",
  autoplay: false,
  loop: false,
  muted: false,
  showControls: true,
  pip: true,
  airplay: true,
  chromecast: true,
  encrytionM3u8: true,
  logoUrl: "",
  isActive: true,
  isDefault: false,
});

const editForm = reactive({
  id: "",
  userId: "",
  name: "",
  description: "",
  autoplay: false,
  loop: false,
  muted: false,
  showControls: true,
  pip: true,
  airplay: true,
  chromecast: true,
  encrytionM3u8: true,
  logoUrl: "",
  isActive: true,
  isDefault: false,
});

const canCreate = computed(() => createForm.userId.trim() && createForm.name.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.userId.trim() && editForm.name.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const summary = computed(() => [
  { label: "Visible configs", value: rows.value.length },
  { label: "Active", value: rows.value.filter((row) => row.isActive).length },
  { label: "Default", value: rows.value.filter((row) => row.isDefault).length },
  { label: "Total records", value: total.value },
]);

const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Owner", value: selectedRow.value.ownerEmail || selectedRow.value.userId || "—" },
    { label: "Status", value: selectedRow.value.isActive ? "ACTIVE" : "INACTIVE" },
    { label: "Default", value: selectedRow.value.isDefault ? "YES" : "NO" },
    { label: "Encrypted HLS", value: selectedRow.value.encrytionM3u8 ? "ENABLED" : "DISABLED" },
    { label: "Logo URL", value: selectedRow.value.logoUrl || "—" },
    { label: "Created", value: formatDate(selectedRow.value.createdAt) },
    { label: "Updated", value: formatDate(selectedRow.value.updatedAt) },
  ];
});

const configFlags = (row: AdminPlayerConfigRow) => {
  const flags: string[] = [];
  if (row.autoplay) flags.push("Autoplay");
  if (row.loop) flags.push("Loop");
  if (row.muted) flags.push("Muted");
  if (row.showControls) flags.push("Controls");
  if (row.pip) flags.push("PiP");
  if (row.airplay) flags.push("AirPlay");
  if (row.chromecast) flags.push("Chromecast");
  if (row.encrytionM3u8) flags.push("Encrypted HLS");
  if (row.logoUrl) flags.push("Logo");
  return flags;
};

const loadConfigs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPlayerConfigs({
      page: page.value,
      limit: limit.value,
      userId: appliedOwnerFilter.value.trim() || undefined,
      search: appliedSearch.value.trim() || undefined,
    });
    rows.value = response.configs ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
    if (selectedRow.value?.id && (detailOpen.value || editOpen.value || deleteOpen.value)) {
      const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
      if (fresh) selectedRow.value = fresh;
    }
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin player configs";
  } finally {
    loading.value = false;
  }
};

const resetCreateForm = () => {
  createForm.userId = "";
  createForm.name = "";
  createForm.description = "";
  createForm.autoplay = false;
  createForm.loop = false;
  createForm.muted = false;
  createForm.showControls = true;
  createForm.pip = true;
  createForm.airplay = true;
  createForm.chromecast = true;
  createForm.encrytionM3u8 = true;
  createForm.logoUrl = "";
  createForm.isActive = true;
  createForm.isDefault = false;
};

const closeDialogs = () => {
  createOpen.value = false;
  detailOpen.value = false;
  editOpen.value = false;
  deleteOpen.value = false;
  actionError.value = null;
};

const applyFilters = async () => {
  page.value = 1;
  appliedSearch.value = search.value;
  appliedOwnerFilter.value = ownerFilter.value;
  await loadConfigs();
};

const openDetailDialog = (row: AdminPlayerConfigRow) => {
  selectedRow.value = row;
  actionError.value = null;
  detailOpen.value = true;
};

const openEditDialog = (row: AdminPlayerConfigRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || "";
  editForm.userId = row.userId || "";
  editForm.name = row.name || "";
  editForm.description = row.description || "";
  editForm.autoplay = !!row.autoplay;
  editForm.loop = !!row.loop;
  editForm.muted = !!row.muted;
  editForm.showControls = !!row.showControls;
  editForm.pip = !!row.pip;
  editForm.airplay = !!row.airplay;
  editForm.chromecast = !!row.chromecast;
  editForm.encrytionM3u8 = row.encrytionM3u8 !== false;
  editForm.logoUrl = row.logoUrl || "";
  editForm.isActive = !!row.isActive;
  editForm.isDefault = !!row.isDefault;
  editOpen.value = true;
};

const openDeleteDialog = (row: AdminPlayerConfigRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminPlayerConfig({
      userId: createForm.userId.trim(),
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      autoplay: createForm.autoplay,
      loop: createForm.loop,
      muted: createForm.muted,
      showControls: createForm.showControls,
      pip: createForm.pip,
      airplay: createForm.airplay,
      chromecast: createForm.chromecast,
      encrytionM3u8: createForm.encrytionM3u8,
      logoUrl: createForm.logoUrl.trim() || undefined,
      isActive: createForm.isActive,
      isDefault: createForm.isDefault,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadConfigs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create player config";
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminPlayerConfig({
      id: editForm.id,
      userId: editForm.userId.trim(),
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      autoplay: editForm.autoplay,
      loop: editForm.loop,
      muted: editForm.muted,
      showControls: editForm.showControls,
      pip: editForm.pip,
      airplay: editForm.airplay,
      chromecast: editForm.chromecast,
      encrytionM3u8: editForm.encrytionM3u8,
      logoUrl: editForm.logoUrl.trim() || undefined,
      isActive: editForm.isActive,
      isDefault: editForm.isDefault,
    });
    editOpen.value = false;
    await loadConfigs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update player config";
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminPlayerConfig({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadConfigs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete player config";
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadConfigs();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadConfigs();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

useAdminPageHeader(() => ({
  eyebrow: 'Playback',
  badge: loading.value ? 'Syncing config presets' : `${total.value} configs loaded`,
  actions: [
    {
      label: 'Refresh',
      variant: 'secondary',
      loading: loading.value,
      onClick: loadConfigs,
    },
    {
      label: 'Create config',
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

const columns = computed<ColumnDef<AdminPlayerConfigRow>[]>(() => [
  {
    id: "config",
    header: "Config",
    accessorFn: row => row.name || "",
    cell: ({ row }) => h("button", { class: "text-left", onClick: () => { openDetailDialog(row.original); } }, [
      h("div", { class: "font-medium text-foreground" }, row.original.name),
      h("div", { class: "mt-1 text-xs text-foreground/60" }, row.original.ownerEmail || row.original.userId || "No owner"),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "flags",
    header: "Flags",
    accessorFn: row => configFlags(row).join(", "),
    cell: ({ row }) => h("div", { class: "flex flex-wrap gap-1" },
      configFlags(row.original).length
        ? configFlags(row.original).map((flag) => h("span", { class: "rounded bg-primary/10 px-2 py-0.5 text-xs text-primary" }, flag))
        : [h("span", { class: "text-foreground/50" }, "—")]
    ),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "status",
    header: "Status",
    accessorFn: row => row.isActive ? "ACTIVE" : "INACTIVE",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.isActive ? "ACTIVE" : "INACTIVE"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "default",
    header: "Default",
    accessorFn: row => row.isDefault ? "YES" : "NO",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.isDefault ? "YES" : "NO"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => h("div", { class: "flex justify-end gap-2" }, [
      h(AppButton, { size: "sm", variant: "secondary", onClick: () => openEditDialog(row.original) }, { default: () => "Edit" }),
      h(AppButton, { size: "sm", variant: "danger", onClick: () => openDeleteDialog(row.original) }, { default: () => "Delete" }),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
]);

onMounted(loadConfigs);
</script>

<template>
  <AdminSectionShell>
    <template #stats>
      <AdminMetricCard
        v-for="item in summary"
        :key="item.label"
        :label="item.label"
        :value="item.value"
      />
    </template>

    <div class="space-y-4">
      <AdminSectionCard title="Filters" description="Search configs by name and narrow by owner reference if needed." bodyClass="p-5">
        <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-end">
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">Search</label>
            <AdminInput v-model="search" placeholder="Search config name" @enter="applyFilters" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">Owner reference</label>
            <AdminInput v-model="ownerFilter" placeholder="Optional owner reference" @enter="applyFilters" />
          </div>
          <div class="flex items-center gap-2 xl:justify-end">
            <AppButton size="sm" variant="ghost" @click="search = ''; ownerFilter = ''; appliedSearch = ''; appliedOwnerFilter = ''; loadConfigs()">Reset</AppButton>
            <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
          </div>
        </div>
      </AdminSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <AdminSectionCard v-else title="Player configs" description="Cross-user player presets and default assignments." bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="5" :rows="4" />

        <AdminTable
          v-else
          :data="rows"
          :columns="columns"
          :get-row-id="(row) => row.id || row.name || ''"
          wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent"
          tableClass="w-full"
          headerRowClass="bg-muted/30"
          bodyRowClass="border-b border-border hover:bg-muted/30"
        >
          <template #empty>
            <div class="px-6 py-12 text-center">
              <p class="mb-1 text-sm text-foreground/60">No player configs matched the current filters.</p>
              <p class="text-xs text-foreground/40">Try a broader config name or clear the owner filter.</p>
            </div>
          </template>
        </AdminTable>

        <div class="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div class="text-xs text-foreground/55">Page {{ page }} of {{ totalPages }} · {{ total }} records</div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton>
            <AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="detailOpen" title="Player config details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.name }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.ownerEmail || selectedRow.userId || 'No owner' }}</div>
      </div>
      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
      <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div class="text-[11px] font-medium text-foreground/55">Flags</div>
        <div class="mt-2 flex flex-wrap gap-2">
          <span v-for="flag in configFlags(selectedRow)" :key="flag" class="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{{ flag }}</span>
          <span v-if="configFlags(selectedRow).length === 0" class="text-sm text-foreground/60">No enabled flags</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="detailOpen = false">Close</AppButton>
        <AppButton size="sm" @click="detailOpen = false; selectedRow && openEditDialog(selectedRow)">Edit</AppButton>
        <AppButton variant="danger" size="sm" @click="detailOpen = false; selectedRow && openDeleteDialog(selectedRow)">Delete</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="createOpen" title="Create player config" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Owner user ID</label>
          <AdminInput v-model="createForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Name</label>
          <AdminInput v-model="createForm.name" placeholder="Default player preset" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Description</label>
          <AdminTextarea v-model="createForm.description" rows="3" placeholder="Optional" />
        </div>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.autoplay" type="checkbox" class="h-4 w-4" /> Autoplay</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.loop" type="checkbox" class="h-4 w-4" /> Loop</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.muted" type="checkbox" class="h-4 w-4" /> Muted</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.showControls" type="checkbox" class="h-4 w-4" /> Show controls</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.pip" type="checkbox" class="h-4 w-4" /> PiP</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.airplay" type="checkbox" class="h-4 w-4" /> AirPlay</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.chromecast" type="checkbox" class="h-4 w-4" /> Chromecast</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.encrytionM3u8" type="checkbox" class="h-4 w-4" /> Encrypted HLS</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.isActive" type="checkbox" class="h-4 w-4" /> Active</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="createForm.isDefault" type="checkbox" class="h-4 w-4" /> Default</label>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Logo URL</label>
          <AdminInput v-model="createForm.logoUrl" placeholder="https://example.com/logo.png" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="editOpen" title="Edit player config" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Owner user ID</label>
          <AdminInput v-model="editForm.userId" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Name</label>
          <AdminInput v-model="editForm.name" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Description</label>
          <AdminTextarea v-model="editForm.description" rows="3" />
        </div>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.autoplay" type="checkbox" class="h-4 w-4" /> Autoplay</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.loop" type="checkbox" class="h-4 w-4" /> Loop</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.muted" type="checkbox" class="h-4 w-4" /> Muted</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.showControls" type="checkbox" class="h-4 w-4" /> Show controls</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.pip" type="checkbox" class="h-4 w-4" /> PiP</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.airplay" type="checkbox" class="h-4 w-4" /> AirPlay</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.chromecast" type="checkbox" class="h-4 w-4" /> Chromecast</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.encrytionM3u8" type="checkbox" class="h-4 w-4" /> Encrypted HLS</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.isActive" type="checkbox" class="h-4 w-4" /> Active</label>
        <label class="flex items-center gap-2 text-sm text-foreground/70"><input v-model="editForm.isDefault" type="checkbox" class="h-4 w-4" /> Default</label>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Logo URL</label>
          <AdminInput v-model="editForm.logoUrl" placeholder="https://example.com/logo.png" />
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdate" @click="submitEdit">Save</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="deleteOpen" title="Delete player config" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-foreground/70">Delete <span class="font-semibold text-foreground">{{ selectedRow?.name }}</span>? This action cannot be undone.</p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton variant="danger" size="sm" :loading="submitting" @click="submitDelete">Delete</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
