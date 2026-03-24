<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AdminInput from "./components/AdminInput.vue";
import AdminSelect from "./components/AdminSelect.vue";
import AdminTextarea from "./components/AdminTextarea.vue";
import AdminSectionCard from "./components/AdminSectionCard.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminMetricCard from "./components/AdminMetricCard.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";
import { formatBytes } from "@/lib/utils";

type ListPlansResponse = Awaited<ReturnType<typeof rpcClient.listAdminPlans>>;
type AdminPlanRow = NonNullable<ListPlansResponse["plans"]>[number];

const cycleOptions = ["monthly", "quarterly", "yearly"] as const;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPlanRow[]>([]);
const selectedRow = ref<AdminPlanRow | null>(null);
const createOpen = ref(false);
const detailOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

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
const summary = computed(() => [
  { label: "Plans", value: rows.value.length },
  { label: "Active", value: rows.value.filter((row) => row.isActive).length },
  { label: "Highest price", value: rows.value.reduce((max, row) => Math.max(max, Number(row.price ?? 0)), 0) },
  { label: "Avg storage", value: formatBytes(Math.round(rows.value.reduce((sum, row) => sum + Number(row.storageLimit ?? 0), 0) / Math.max(rows.value.length, 1))) },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Cycle", value: selectedRow.value.cycle || "—" },
    { label: "Price", value: String(selectedRow.value.price ?? 0) },
    { label: "Storage", value: String(selectedRow.value.storageLimit ?? 0) },
    { label: "Uploads", value: String(selectedRow.value.uploadLimit ?? 0) },
    { label: "Status", value: selectedRow.value.isActive ? "ACTIVE" : "INACTIVE" },
  ];
});

const loadPlans = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPlans();
    rows.value = response.plans ?? [];
    if (selectedRow.value?.id && (detailOpen.value || editOpen.value || deleteOpen.value)) {
      const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
      if (fresh) selectedRow.value = fresh;
    }
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
  detailOpen.value = false;
  editOpen.value = false;
  deleteOpen.value = false;
  actionError.value = null;
};

const openDetailDialog = (row: AdminPlanRow) => {
  selectedRow.value = row;
  actionError.value = null;
  detailOpen.value = true;
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

useAdminPageHeader(() => ({
  eyebrow: "Catalog",
  badge: `${rows.value.length} plans loaded`,
  actions: [
    {
      label: "Refresh",
      variant: "secondary",
      loading: loading.value,
      onClick: loadPlans,
    },
    {
      label: "Create plan",
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

onMounted(loadPlans);
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
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
      <div v-else-if="loading" class="rounded-lg border border-border bg-muted/20 px-4 py-10 text-center text-foreground/60">Loading plans...</div>
      <div v-else-if="rows.length === 0" class="rounded-lg border border-border bg-muted/20 px-4 py-10 text-center text-foreground/60">No plans found.</div>
    <div class="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" v-else>
      <div v-for="row in rows" :key="row.id" class="flex flex-col max-w-sm w-full bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-xl">
        <div class="p-6 border-b border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ row.name }}</h3>
              <p class="text-sm text-gray-500">{{ row.description || 'No description' }}</p>
            </div>
            <span v-if="row.isActive" class="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Active</span>
            <span v-else class="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Inactive</span>
          </div>
          <div class="mt-4">
            <span class="text-3xl font-extrabold text-gray-900">${{ row.price }}</span>
            <span class="text-gray-500 text-sm">/{{ row.cycle }}</span>
          </div>
        </div>

        <div class="p-6 bg-gray-50/50 space-y-4">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="Check-circle" />
            </svg>
            <span class="text-sm text-gray-700">Storage: {{ formatBytes(row.storageLimit) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="Check-circle" />
            </svg>
            <span class="text-sm text-gray-700">Uploads: {{ row.uploadLimit }}</span>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4">
            <div class="text-xs font-medium text-gray-500">Features</div>
            <ul class="mt-2 space-y-1 text-sm text-gray-700">
              <li v-for="feature in row.features || []" :key="feature">• {{ feature }}</li>
              <li v-if="!(row.features || []).length" class="text-gray-500">No features listed.</li>
            </ul>
          </div>
        </div>

        <div class="p-4 bg-white flex gap-2 mt-a">
          <AppButton size="sm" variant="secondary" @click="openEditDialog(row)">
            Edit Plan
          </AppButton>
          <AppButton size="sm" variant="secondary" @click="openDetailDialog(row)">Details</AppButton>
          <AppButton size="sm" variant="secondary" @click="openMenuDialog(row)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="Circle-dots-horizontal" />
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </AppButton>
        </div>
      </div>
  </div>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="detailOpen" title="Plan details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.name }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.description || 'No description' }}</div>
      </div>
      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
      <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div class="text-[11px] font-medium text-foreground/55">Features</div>
        <ul class="mt-2 space-y-1 text-sm text-foreground/70">
          <li v-for="feature in selectedRow.features || []" :key="feature">• {{ feature }}</li>
          <li v-if="!(selectedRow.features || []).length" class="text-foreground/50">No features listed.</li>
        </ul>
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

  <AppDialog v-model:visible="createOpen" title="Create admin plan" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Name</label>
          <AdminInput v-model="createForm.name" placeholder="Starter" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Description</label>
          <AdminTextarea v-model="createForm.description" :rows="3" placeholder="Optional" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Features</label>
          <AdminTextarea v-model="createForm.featuresText" :rows="4" placeholder="One feature per line" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Price</label>
          <AdminInput v-model="createForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Cycle</label>
          <AdminSelect v-model="createForm.cycle">
            <option v-for="cycle in cycleOptions" :key="cycle" :value="cycle">{{ cycle }}</option>
          </AdminSelect>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Storage limit</label>
          <AdminInput v-model="createForm.storageLimit" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Upload limit</label>
          <AdminInput v-model="createForm.uploadLimit" type="number" min="1" />
        </div>
        <label class="flex items-center gap-2 text-sm text-foreground/70 md:col-span-2">
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
          <label class="text-sm font-medium text-foreground/70">Name</label>
          <AdminInput v-model="editForm.name" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Description</label>
          <AdminTextarea v-model="editForm.description" :rows="3" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Features</label>
          <AdminTextarea v-model="editForm.featuresText" :rows="4" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Price</label>
          <AdminInput v-model="editForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Cycle</label>
          <AdminSelect v-model="editForm.cycle">
            <option v-for="cycle in cycleOptions" :key="cycle" :value="cycle">{{ cycle }}</option>
          </AdminSelect>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Storage limit</label>
          <AdminInput v-model="editForm.storageLimit" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Upload limit</label>
          <AdminInput v-model="editForm.uploadLimit" type="number" min="1" />
        </div>
        <label class="flex items-center gap-2 text-sm text-foreground/70 md:col-span-2">
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
      <p class="text-sm text-foreground/70">
        Delete or deactivate plan <span class="font-medium">{{ selectedRow?.name || 'this plan' }}</span>.
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
