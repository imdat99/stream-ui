<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminVideoRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminVideoRow[]>([]);
const selectedRow = ref<AdminVideoRow | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const statusOptions = ["UPLOADED", "PROCESSING", "READY", "FAILED"];

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

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeNumber = (value: number | null) => (value == null ? undefined : value);

const canCreate = computed(() => createForm.userId.trim() && createForm.title.trim() && createForm.url.trim() && createForm.status.trim());
const canUpdate = computed(() => editForm.id.trim() && editForm.userId.trim() && editForm.title.trim() && editForm.url.trim() && editForm.status.trim());

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
  selectedRow.value = null;
  actionError.value = null;
};

const loadVideos = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminVideos({ page: 1, limit: 20 });
    rows.value = response.videos ?? [];
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin videos";
  } finally {
    loading.value = false;
  }
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
    selectedRow.value = null;
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
    await loadVideos();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete video";
  } finally {
    submitting.value = false;
  }
};

onMounted(loadVideos);
</script>

<template>
  <AdminSectionShell
    title="Admin Videos"
    description="Cross-user video list from admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create video</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">ID</th>
            <th class="py-3 pr-4 font-medium">Title</th>
            <th class="py-3 pr-4 font-medium">Owner</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 font-medium">Format</th>
            <th class="py-3 pr-4 font-medium">Size</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">Loading videos...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">No videos found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">{{ row.id }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.title }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.ownerEmail || row.userId }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.status }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.format || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.size ?? 0 }}</td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <AppButton size="sm" variant="secondary" @click="openEditDialog(row)">Edit</AppButton>
                <AppButton size="sm" variant="danger" @click="openDeleteDialog(row)">Delete</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
