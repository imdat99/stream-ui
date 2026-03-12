<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminPlanRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPlanRow[]>([]);
const selectedRow = ref<AdminPlanRow | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const cycleOptions = ["monthly", "quarterly", "yearly"];

const createForm = reactive({
  name: "",
  description: "",
  featuresText: "",
  price: 0,
  cycle: "monthly",
  storageLimit: 1,
  uploadLimit: 1,
  isActive: true,
});

const editForm = reactive({
  id: "",
  name: "",
  description: "",
  featuresText: "",
  price: 0,
  cycle: "monthly",
  storageLimit: 1,
  uploadLimit: 1,
  isActive: true,
});

const parseFeatures = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const canCreate = computed(() => createForm.name.trim() && createForm.cycle.trim() && createForm.storageLimit > 0 && createForm.uploadLimit > 0);
const canUpdate = computed(() => editForm.id.trim() && editForm.name.trim() && editForm.cycle.trim() && editForm.storageLimit > 0 && editForm.uploadLimit > 0);

const loadPlans = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPlans();
    rows.value = response.plans ?? [];
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin plans";
  } finally {
    loading.value = false;
  }
};

const resetCreateForm = () => {
  createForm.name = "";
  createForm.description = "";
  createForm.featuresText = "";
  createForm.price = 0;
  createForm.cycle = "monthly";
  createForm.storageLimit = 1;
  createForm.uploadLimit = 1;
  createForm.isActive = true;
};

const closeDialogs = () => {
  createOpen.value = false;
  editOpen.value = false;
  deleteOpen.value = false;
  selectedRow.value = null;
  actionError.value = null;
};

const openEditDialog = (row: AdminPlanRow) => {
  selectedRow.value = row;
  actionError.value = null;
  editForm.id = row.id || "";
  editForm.name = row.name || "";
  editForm.description = row.description || "";
  editForm.featuresText = (row.features ?? []).join("\n");
  editForm.price = row.price ?? 0;
  editForm.cycle = row.cycle || "monthly";
  editForm.storageLimit = row.storageLimit ?? 1;
  editForm.uploadLimit = row.uploadLimit ?? 1;
  editForm.isActive = !!row.isActive;
  editOpen.value = true;
};

const openDeleteDialog = (row: AdminPlanRow) => {
  selectedRow.value = row;
  actionError.value = null;
  deleteOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminPlan({
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      features: parseFeatures(createForm.featuresText),
      price: createForm.price,
      cycle: createForm.cycle,
      storageLimit: createForm.storageLimit,
      uploadLimit: createForm.uploadLimit,
      isActive: createForm.isActive,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadPlans();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create plan";
  } finally {
    submitting.value = false;
  }
};

const submitEdit = async () => {
  if (!canUpdate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminPlan({
      id: editForm.id,
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      features: parseFeatures(editForm.featuresText),
      price: editForm.price,
      cycle: editForm.cycle,
      storageLimit: editForm.storageLimit,
      uploadLimit: editForm.uploadLimit,
      isActive: editForm.isActive,
    });
    editOpen.value = false;
    selectedRow.value = null;
    await loadPlans();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update plan";
  } finally {
    submitting.value = false;
  }
};

const submitDelete = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.deleteAdminPlan({ id: selectedRow.value.id });
    deleteOpen.value = false;
    selectedRow.value = null;
    await loadPlans();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to delete plan";
  } finally {
    submitting.value = false;
  }
};

onMounted(loadPlans);
</script>

<template>
  <AdminSectionShell
    title="Admin Plans"
    description="Subscription plans managed via admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create plan</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">Name</th>
            <th class="py-3 pr-4 font-medium">Price</th>
            <th class="py-3 pr-4 font-medium">Cycle</th>
            <th class="py-3 pr-4 font-medium">Storage</th>
            <th class="py-3 pr-4 font-medium">Uploads</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">Loading plans...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">No plans found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">
              <div class="font-medium">{{ row.name }}</div>
              <div class="text-xs text-gray-500">{{ row.description || '—' }}</div>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ row.price }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.cycle }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.storageLimit }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.uploadLimit }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.isActive ? 'ACTIVE' : 'INACTIVE' }}</td>
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

  <AppDialog v-model:visible="createOpen" title="Create admin plan" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Name</label>
          <AppInput v-model="createForm.name" placeholder="Starter" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="createForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Features</label>
          <textarea v-model="createForm.featuresText" rows="4" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="One feature per line" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Price</label>
          <AppInput v-model="createForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Cycle</label>
          <select v-model="createForm.cycle" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="cycle in cycleOptions" :key="cycle" :value="cycle">{{ cycle }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Storage limit</label>
          <AppInput v-model="createForm.storageLimit" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Upload limit</label>
          <AppInput v-model="createForm.uploadLimit" type="number" min="1" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
          <input v-model="createForm.isActive" type="checkbox" class="h-4 w-4" />
          Active
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

  <AppDialog v-model:visible="editOpen" title="Edit plan" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Name</label>
          <AppInput v-model="editForm.name" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="editForm.description" rows="3" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Features</label>
          <textarea v-model="editForm.featuresText" rows="4" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Price</label>
          <AppInput v-model="editForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Cycle</label>
          <select v-model="editForm.cycle" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="cycle in cycleOptions" :key="cycle" :value="cycle">{{ cycle }}</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Storage limit</label>
          <AppInput v-model="editForm.storageLimit" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Upload limit</label>
          <AppInput v-model="editForm.uploadLimit" type="number" min="1" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
          <input v-model="editForm.isActive" type="checkbox" class="h-4 w-4" />
          Active
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

  <AppDialog v-model:visible="deleteOpen" title="Delete plan" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Delete or deactivate plan <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
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
