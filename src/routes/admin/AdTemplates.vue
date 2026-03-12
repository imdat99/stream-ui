<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminAdTemplateRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminAdTemplateRow[]>([]);
const selectedRow = ref<AdminAdTemplateRow | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const formatOptions = ["pre-roll", "mid-roll", "post-roll"];

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

const loadTemplates = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminAdTemplates({ page: 1, limit: 20 });
    rows.value = response.templates ?? [];
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
  selectedRow.value = null;
  actionError.value = null;
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
    selectedRow.value = null;
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
    await loadTemplates();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete ad template";
  } finally {
    submitting.value = false;
  }
};

onMounted(loadTemplates);
</script>

<template>
  <AdminSectionShell
    title="Admin Ad Templates"
    description="Cross-user ad template management over admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create template</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">Name</th>
            <th class="py-3 pr-4 font-medium">Owner</th>
            <th class="py-3 pr-4 font-medium">Format</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 font-medium">Default</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="6" class="py-6 text-center text-gray-500">Loading ad templates...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="6" class="py-6 text-center text-gray-500">No ad templates found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">
              <div class="font-medium">{{ row.name }}</div>
              <div class="text-xs text-gray-500">{{ row.vastTagUrl }}</div>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ row.ownerEmail || row.userId }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.adFormat || 'pre-roll' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.isActive ? 'ACTIVE' : 'INACTIVE' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.isDefault ? 'YES' : 'NO' }}</td>
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
          <textarea v-model="createForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">VAST URL</label>
          <AppInput v-model="createForm.vastTagUrl" placeholder="https://..." />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad format</label>
          <select v-model="createForm.adFormat" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
          <textarea v-model="editForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">VAST URL</label>
          <AppInput v-model="editForm.vastTagUrl" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Ad format</label>
          <select v-model="editForm.adFormat" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
