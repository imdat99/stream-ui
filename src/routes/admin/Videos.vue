<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListVideosResponse = Awaited<ReturnType<typeof rpcClient.listAdminVideos>>;
type AdminVideoRow = NonNullable<ListVideosResponse["videos"]>[number];

const statusOptions = ["UPLOADED", "PROCESSING", "READY", "FAILED"] as const;
const statusFilterOptions = ["", ...statusOptions] as const;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminVideoRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminVideoRow | null>(null);
const search = ref("");
const appliedSearch = ref("");
const ownerFilter = ref("");
const appliedOwnerFilter = ref("");
const statusFilter = ref<(typeof statusFilterOptions)[number]>("");
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

const createForm = reactive({
  userId: "",
  title: "",
  description: "",
  url: "",
  size: null as number | null,
  duration: null as number | null,
  format: "",
  status: "READY",
  adTemplateId: "",
});

const editForm = reactive({
  id: "",
  userId: "",
  title: "",
  description: "",
  url: "",
  size: null as number | null,
  duration: null as number | null,
  format: "",
  status: "READY",
  adTemplateId: "",
});

const canCreate = computed(() => createForm.userId.trim() && createForm.title.trim() && createForm.url.trim() && createForm.status.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.userId.trim() && editForm.title.trim() && editForm.url.trim() && editForm.status.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const summary = computed(() => [
  { label: "Visible videos", value: rows.value.length },
  { label: "Ready assets", value: rows.value.filter((row) => row.status === "READY").length },
  { label: "Processing", value: rows.value.filter((row) => row.status === "PROCESSING").length },
  { label: "Total records", value: total.value },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Owner", value: selectedRow.value.ownerEmail || selectedRow.value.userId || "—" },
    { label: "Status", value: selectedRow.value.status || "—" },
    { label: "Format", value: selectedRow.value.format || "—" },
    { label: "Size", value: formatBytes(selectedRow.value.size) },
    { label: "Duration", value: formatDuration(selectedRow.value.duration) },
    { label: "Updated", value: formatDate(selectedRow.value.updatedAt || selectedRow.value.createdAt) },
  ];
});

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeNumber = (value: number | null) => (value == null ? undefined : value);

const resetCreateForm = () => {
  createForm.userId = "";
  createForm.title = "";
  createForm.description = "";
  createForm.url = "";
  createForm.size = null;
  createForm.duration = null;
  createForm.format = "";
  createForm.status = "READY";
  createForm.adTemplateId = "";
};

const closeDialogs = () => {
  createOpen.value = false;
  editOpen.value = false;
  deleteOpen.value = false;
  actionError.value = null;
};

const syncSelectedRow = () => {
  if (!selectedRow.value?.id) return;
  const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
  if (fresh) selectedRow.value = fresh;
};

const loadVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminVideos({
      page: page.value,
      limit: limit.value,
      search: appliedSearch.value.trim() || undefined,
      userId: appliedOwnerFilter.value.trim() || undefined,
      status: statusFilter.value || undefined,
    });
    rows.value = response.videos ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
    syncSelectedRow();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin videos";
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  page.value = 1;
  appliedSearch.value = search.value;
  appliedOwnerFilter.value = ownerFilter.value;
  await loadVideos();
};

const openEditDialog = (row: AdminVideoRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || "";
  editForm.userId = row.userId || "";
  editForm.title = row.title || "";
  editForm.description = row.description || "";
  editForm.url = row.url || "";
  editForm.size = row.size ?? null;
  editForm.duration = row.duration ?? null;
  editForm.format = row.format || "";
  editForm.status = row.status || "READY";
  editForm.adTemplateId = row.adTemplateId || "";
  editOpen.value = true;
};

const openDeleteDialog = (row: AdminVideoRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminVideo({
      userId: createForm.userId.trim(),
      title: createForm.title.trim(),
      description: normalizeOptional(createForm.description),
      url: createForm.url.trim(),
      size: normalizeNumber(createForm.size),
      duration: normalizeNumber(createForm.duration),
      format: normalizeOptional(createForm.format),
      status: createForm.status,
      adTemplateId: normalizeOptional(createForm.adTemplateId),
    });
    resetCreateForm();
    createOpen.value = false;
    await loadVideos();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create video";
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminVideo({
      id: editForm.id,
      userId: editForm.userId.trim(),
      title: editForm.title.trim(),
      description: normalizeOptional(editForm.description),
      url: editForm.url.trim(),
      size: normalizeNumber(editForm.size),
      duration: normalizeNumber(editForm.duration),
      format: normalizeOptional(editForm.format),
      status: editForm.status,
      adTemplateId: normalizeOptional(editForm.adTemplateId),
    });
    editOpen.value = false;
    await loadVideos();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update video";
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminVideo({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    if (page.value > 1 && rows.value.length === 1) page.value -= 1;
    await loadVideos();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete video";
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadVideos();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadVideos();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatBytes = (value?: number) => {
  const bytes = Number(value || 0);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const normalized = bytes / 1024 ** index;
  return `${normalized.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatDuration = (value?: number) => {
  const seconds = Number(value || 0);
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case "READY":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

watch(statusFilter, async () => {
  page.value = 1;
  await loadVideos();
});

onMounted(loadVideos);
</script>

<template>
  <AdminSectionShell
    title="Admin Videos"
    description="Cross-user video inventory with direct edit, moderation and storage context."
    eyebrow="Media"
    :badge="`${total} total videos`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" @click="loadVideos">Refresh</AppButton>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create video</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected video</div>
        <div v-if="selectedRow" class="space-y-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ selectedRow.title }}</div>
            <div class="mt-1 text-sm text-slate-400">{{ selectedRow.id }}</div>
          </div>
          <div class="grid gap-3">
            <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">Source URL</div>
            <div class="mt-2 break-all text-sm text-slate-200">{{ selectedRow.url }}</div>
          </div>
          <div class="grid gap-2">
            <AppButton size="sm" @click="openEditDialog(selectedRow)">Edit video</AppButton>
            <AppButton size="sm" variant="danger" @click="openDeleteDialog(selectedRow)">Delete video</AppButton>
          </div>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
          Select a video to review metadata, storage footprint and upstream source URL.
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:grid-cols-[minmax(0,1fr)_220px_180px_auto] xl:items-end">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
          <AppInput v-model="search" placeholder="Search by title" @enter="applyFilters" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Owner user ID</label>
          <AppInput v-model="ownerFilter" placeholder="Optional owner id" @enter="applyFilters" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</label>
          <select v-model="statusFilter" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="status in statusFilterOptions" :key="status || 'all'" :value="status">{{ status || 'ALL' }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2 xl:justify-end">
          <AppButton size="sm" variant="ghost" @click="search = ''; ownerFilter = ''; appliedSearch = ''; appliedOwnerFilter = ''; statusFilter = ''; loadVideos()">Reset</AppButton>
          <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50/90 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Video</th>
                <th class="px-4 py-3 font-semibold">Owner</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Format</th>
                <th class="px-4 py-3 font-semibold">Size</th>
                <th class="px-4 py-3 font-semibold">Duration</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading videos...</td>
              </tr>
              <tr v-else-if="rows.length === 0" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">No videos matched the current filters.</td>
              </tr>
              <tr v-for="row in rows" :key="row.id" class="border-t border-slate-200 transition-colors hover:bg-slate-50/70" :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''">
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectedRow = row">
                    <div class="font-medium text-slate-900">{{ row.title }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.id }}</div>
                  </button>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.ownerEmail || row.userId }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="statusBadgeClass(row.status)">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.format || '—' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ formatBytes(row.size) }}</td>
                <td class="px-4 py-3 text-slate-700">{{ formatDuration(row.duration) }}</td>
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

  <AppDialog v-model:visible="createOpen" title="Create admin video" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Owner user ID</label>
          <AppInput v-model="createForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <select v-model="createForm.status" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <AppInput v-model="createForm.title" placeholder="Video title" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Video URL</label>
          <AppInput v-model="createForm.url" placeholder="https://..." />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="createForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Format</label>
          <AppInput v-model="createForm.format" placeholder="mp4" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad template ID</label>
          <AppInput v-model="createForm.adTemplateId" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Size</label>
          <AppInput v-model="createForm.size" type="number" placeholder="0" min="0" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Duration</label>
          <AppInput v-model="createForm.duration" type="number" placeholder="0" min="0" />
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

  <AppDialog v-model:visible="editOpen" title="Edit video" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Owner user ID</label>
          <AppInput v-model="editForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <select v-model="editForm.status" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Title</label>
          <AppInput v-model="editForm.title" placeholder="Video title" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Video URL</label>
          <AppInput v-model="editForm.url" placeholder="https://..." />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="editForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Format</label>
          <AppInput v-model="editForm.format" placeholder="mp4" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad template ID</label>
          <AppInput v-model="editForm.adTemplateId" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Size</label>
          <AppInput v-model="editForm.size" type="number" placeholder="0" min="0" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Duration</label>
          <AppInput v-model="editForm.duration" type="number" placeholder="0" min="0" />
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

  <AppDialog v-model:visible="deleteOpen" title="Delete video" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Delete video <span class="font-medium">{{ selectedRow?.title || selectedRow?.id }}</span>.
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
