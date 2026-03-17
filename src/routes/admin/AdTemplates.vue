<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import BaseTable from "@/components/ui/table/BaseTable.vue";
import SettingsSectionCard from "@/routes/settings/components/SettingsSectionCard.vue";
import { type ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref } from "vue";
import AdminPlaceholderTable from "./components/AdminPlaceholderTable.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type ListTemplatesResponse = Awaited<ReturnType<typeof rpcClient.listAdminAdTemplates>>;
type AdminAdTemplateRow = NonNullable<ListTemplatesResponse["templates"]>[number];

const formatOptions = ["pre-roll", "mid-roll", "post-roll"] as const;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminAdTemplateRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminAdTemplateRow | null>(null);
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
  vastTagUrl: "",
  adFormat: "pre-roll",
  duration: null as number | null,
  isActive: true,
  isDefault: false,
});

const editForm = reactive({
  id: "",
  userId: "",
  name: "",
  description: "",
  vastTagUrl: "",
  adFormat: "pre-roll",
  duration: null as number | null,
  isActive: true,
  isDefault: false,
});

const canCreate = computed(() => createForm.userId.trim() && createForm.name.trim() && createForm.vastTagUrl.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.userId.trim() && editForm.name.trim() && editForm.vastTagUrl.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const summary = computed(() => [
  { label: "Visible templates", value: rows.value.length },
  { label: "Active", value: rows.value.filter((row) => row.isActive).length },
  { label: "Default", value: rows.value.filter((row) => row.isDefault).length },
  { label: "Total records", value: total.value },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Owner", value: selectedRow.value.ownerEmail || selectedRow.value.userId || "—" },
    { label: "Format", value: selectedRow.value.adFormat || "—" },
    { label: "Status", value: selectedRow.value.isActive ? "ACTIVE" : "INACTIVE" },
    { label: "Default", value: selectedRow.value.isDefault ? "YES" : "NO" },
    { label: "Duration", value: selectedRow.value.duration ? `${selectedRow.value.duration}s` : "—" },
    { label: "Created", value: formatDate(selectedRow.value.createdAt) },
  ];
});

const loadTemplates = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminAdTemplates({
      page: page.value,
      limit: limit.value,
      userId: appliedOwnerFilter.value.trim() || undefined,
      search: appliedSearch.value.trim() || undefined,
    });
    rows.value = response.templates ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
    if (selectedRow.value?.id && (detailOpen.value || editOpen.value || deleteOpen.value)) {
      const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
      if (fresh) selectedRow.value = fresh;
    }
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin ad templates";
  } finally {
    loading.value = false;
  }
};

const resetCreateForm = () => {
  createForm.userId = "";
  createForm.name = "";
  createForm.description = "";
  createForm.vastTagUrl = "";
  createForm.adFormat = "pre-roll";
  createForm.duration = null;
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
  await loadTemplates();
};

const openDetailDialog = (row: AdminAdTemplateRow) => {
  selectedRow.value = row;
  actionError.value = null;
  detailOpen.value = true;
};

const openEditDialog = (row: AdminAdTemplateRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || "";
  editForm.userId = row.userId || "";
  editForm.name = row.name || "";
  editForm.description = row.description || "";
  editForm.vastTagUrl = row.vastTagUrl || "";
  editForm.adFormat = row.adFormat || "pre-roll";
  editForm.duration = row.duration ?? null;
  editForm.isActive = !!row.isActive;
  editForm.isDefault = !!row.isDefault;
  editOpen.value = true;
};

const openDeleteDialog = (row: AdminAdTemplateRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminAdTemplate({
      userId: createForm.userId.trim(),
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      vastTagUrl: createForm.vastTagUrl.trim(),
      adFormat: createForm.adFormat,
      duration: createForm.duration == null ? undefined : createForm.duration,
      isActive: createForm.isActive,
      isDefault: createForm.isDefault,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadTemplates();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create ad template";
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminAdTemplate({
      id: editForm.id,
      userId: editForm.userId.trim(),
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      vastTagUrl: editForm.vastTagUrl.trim(),
      adFormat: editForm.adFormat,
      duration: editForm.duration == null ? undefined : editForm.duration,
      isActive: editForm.isActive,
      isDefault: editForm.isDefault,
    });
    editOpen.value = false;
    await loadTemplates();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update ad template";
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminAdTemplate({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadTemplates();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete ad template";
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadTemplates();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadTemplates();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const columns = computed<ColumnDef<AdminAdTemplateRow>[]>(() => [
  {
    id: "template",
    header: "Template",
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
    id: "owner",
    header: "Owner",
    accessorFn: row => row.ownerEmail || row.userId || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.ownerEmail || row.original.userId || "—"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "format",
    header: "Format",
    accessorFn: row => row.adFormat || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.adFormat || "pre-roll"),
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

useAdminPageHeader(() => ({
  eyebrow: "Advertising",
  badge: `${total.value} total templates`,
  actions: [
    {
      label: "Refresh",
      variant: "secondary",
      onClick: loadTemplates,
    },
    {
      label: "Create template",
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

onMounted(loadTemplates);
</script>

<template>
  <AdminSectionShell>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-lg border border-border bg-muted/20 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-foreground">{{ item.value }}</div>
      </div>
    </template>

    <div class="space-y-4">
      <SettingsSectionCard title="Filters" description="Search templates by name and narrow by owner reference if needed." bodyClass="p-5">
        <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-end">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">Search</label>
            <AppInput v-model="search" placeholder="Search template name" @enter="applyFilters" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">Owner reference</label>
            <AppInput v-model="ownerFilter" placeholder="Optional owner reference" @enter="applyFilters" />
          </div>
          <div class="flex items-center gap-2 xl:justify-end">
            <AppButton size="sm" variant="ghost" @click="search = ''; ownerFilter = ''; appliedSearch = ''; appliedOwnerFilter = ''; loadTemplates()">Reset</AppButton>
            <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
          </div>
        </div>
      </SettingsSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <SettingsSectionCard v-else title="Templates" description="Reusable ad templates and ownership metadata." bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="6" :rows="4" />

        <BaseTable
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
              <p class="mb-1 text-sm text-foreground/60">No templates matched the current filters.</p>
              <p class="text-xs text-foreground/40">Try a broader template name or clear the owner filter.</p>
            </div>
          </template>
        </BaseTable>

        <div class="flex flex-col gap-3 border-t border-border bg-muted/20 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div class="text-xs font-medium uppercase tracking-[0.16em] text-foreground/50">Page {{ page }} of {{ totalPages }} · {{ total }} records</div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton>
            <AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="detailOpen" title="Template details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.name }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.ownerEmail || selectedRow.userId || 'No owner' }}</div>
      </div>
      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
      <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">VAST URL</div>
        <div class="mt-2 break-all text-sm text-foreground/70">{{ selectedRow.vastTagUrl }}</div>
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

  <AppDialog v-model:visible="createOpen" title="Create ad template" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Owner user ID</label>
          <AppInput v-model="createForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Name</label>
          <AppInput v-model="createForm.name" placeholder="Preroll template" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="createForm.description" rows="3" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">VAST URL</label>
          <AppInput v-model="createForm.vastTagUrl" placeholder="https://..." />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad format</label>
          <select v-model="createForm.adFormat" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="format in formatOptions" :key="format" :value="format">{{ format }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Duration</label>
          <AppInput v-model="createForm.duration" type="number" min="0" placeholder="Optional" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="createForm.isActive" type="checkbox" class="h-4 w-4" />
          Active
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="createForm.isDefault" type="checkbox" class="h-4 w-4" />
          Default
        </label>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="editOpen" title="Edit ad template" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Owner user ID</label>
          <AppInput v-model="editForm.userId" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Name</label>
          <AppInput v-model="editForm.name" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="editForm.description" rows="3" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">VAST URL</label>
          <AppInput v-model="editForm.vastTagUrl" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad format</label>
          <select v-model="editForm.adFormat" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="format in formatOptions" :key="format" :value="format">{{ format }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Duration</label>
          <AppInput v-model="editForm.duration" type="number" min="0" placeholder="Optional" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="editForm.isActive" type="checkbox" class="h-4 w-4" />
          Active
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input v-model="editForm.isDefault" type="checkbox" class="h-4 w-4" />
          Default
        </label>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdate" @click="submitEdit">Save</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="deleteOpen" title="Delete ad template" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Delete ad template <span class="font-medium">{{ selectedRow?.name || 'this template' }}</span>.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton variant="danger" size="sm" :loading="submitting" @click="submitDelete">Delete</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
