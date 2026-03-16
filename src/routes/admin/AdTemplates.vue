<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

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
    if (selectedRow.value?.id) {
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

onMounted(loadTemplates);
</script>

<template>
  <AdminSectionShell
    title="Admin Ad Templates"
    description="Operate VAST templates as reusable assets with quick filtering, defaults and owner context."
    eyebrow="Advertising"
    :badge="`${total} total templates`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" @click="loadTemplates">Refresh</AppButton>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create template</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected template</div>
        <div v-if="selectedRow" class="space-y-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ selectedRow.name }}</div>
            <div class="mt-1 text-sm text-slate-400">{{ selectedRow.id }}</div>
          </div>
          <div class="grid gap-3">
            <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">VAST URL</div>
            <div class="mt-2 break-all text-sm text-slate-200">{{ selectedRow.vastTagUrl }}</div>
          </div>
          <div class="grid gap-2">
            <AppButton size="sm" @click="openEditDialog(selectedRow)">Edit template</AppButton>
            <AppButton size="sm" variant="danger" @click="openDeleteDialog(selectedRow)">Delete template</AppButton>
          </div>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
          Select a template to inspect status, default flag and VAST source.
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:grid-cols-[minmax(0,1fr)_220px_auto] xl:items-end">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
          <AppInput v-model="search" placeholder="Search template name" @enter="applyFilters" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Owner user ID</label>
          <AppInput v-model="ownerFilter" placeholder="Optional owner id" @enter="applyFilters" />
        </div>
        <div class="flex items-center gap-2 xl:justify-end">
          <AppButton size="sm" variant="ghost" @click="search = ''; ownerFilter = ''; appliedSearch = ''; appliedOwnerFilter = ''; loadTemplates()">Reset</AppButton>
          <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50/90 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Template</th>
                <th class="px-4 py-3 font-semibold">Owner</th>
                <th class="px-4 py-3 font-semibold">Format</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Default</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="6" class="px-4 py-10 text-center text-slate-500">Loading ad templates...</td>
              </tr>
              <tr v-else-if="rows.length === 0" class="border-t border-slate-200">
                <td colspan="6" class="px-4 py-10 text-center text-slate-500">No templates matched the current filters.</td>
              </tr>
              <tr v-for="row in rows" :key="row.id" class="border-t border-slate-200 transition-colors hover:bg-slate-50/70" :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''">
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectedRow = row">
                    <div class="font-medium text-slate-900">{{ row.name }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.id }}</div>
                  </button>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.ownerEmail || row.userId }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.adFormat || 'pre-roll' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.isActive ? 'ACTIVE' : 'INACTIVE' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.isDefault ? 'YES' : 'NO' }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton size="sm" variant="secondary" @click="openEditDialog(row)">Edit</AppButton>
                    <AppButton size="sm" variant="danger" @click="openDeleteDialog(row)">Delete</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div class="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Page {{ page }} of {{ totalPages }} · {{ total }} records</div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="previousPage">Previous</AppButton>
            <AppButton size="sm" variant="secondary" :disabled="page >= totalPages || loading" @click="nextPage">Next</AppButton>
          </div>
        </div>
      </div>
    </div>
  </AdminSectionShell>

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
        Delete ad template <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
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
