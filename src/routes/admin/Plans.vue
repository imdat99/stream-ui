<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AppInput from "@/components/ui/AppInput.vue";
import SettingsSectionCard from "@/routes/settings/components/SettingsSectionCard.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

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
  { label: "Avg storage", value: Math.round(rows.value.reduce((sum, row) => sum + Number(row.storageLimit ?? 0), 0) / Math.max(rows.value.length, 1)) },
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
      <div v-for="item in summary" :key="item.label" class="rounded-lg border border-border bg-muted/20 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-foreground">{{ item.value }}</div>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
      <div v-else-if="loading" class="rounded-lg border border-border bg-muted/20 px-4 py-10 text-center text-foreground/60">Loading plans...</div>
      <div v-else-if="rows.length === 0" class="rounded-lg border border-border bg-muted/20 px-4 py-10 text-center text-foreground/60">No plans found.</div>
      <div v-else class="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <SettingsSectionCard
          v-for="row in rows"
          :key="row.id"
          :title="row.name"
          :description="row.description || 'No description'"
          bodyClass="p-5"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="grid grid-cols-2 gap-3 flex-1 text-sm text-foreground/70">
                <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Price</div>
                  <div class="mt-1 font-semibold text-foreground">{{ row.price }}</div>
                </div>
                <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Cycle</div>
                  <div class="mt-1 font-semibold text-foreground">{{ row.cycle }}</div>
                </div>
                <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Storage</div>
                  <div class="mt-1 font-semibold text-foreground">{{ row.storageLimit }}</div>
                </div>
                <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Uploads</div>
                  <div class="mt-1 font-semibold text-foreground">{{ row.uploadLimit }}</div>
                </div>
              </div>
              <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="row.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted/40 text-foreground/70'">
                {{ row.isActive ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </div>

            <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Features</div>
              <ul class="mt-2 space-y-1 text-sm text-foreground/70">
                <li v-for="feature in row.features || []" :key="feature">• {{ feature }}</li>
                <li v-if="!(row.features || []).length" class="text-foreground/50">No features listed.</li>
              </ul>
            </div>

            <div class="flex justify-end gap-2">
              <AppButton size="sm" variant="secondary" @click="openDetailDialog(row)">Details</AppButton>
              <AppButton size="sm" @click="openEditDialog(row)">Edit</AppButton>
              <AppButton size="sm" variant="danger" @click="openDeleteDialog(row)">Delete</AppButton>
            </div>
          </div>
        </SettingsSectionCard>
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
          <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
      <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Features</div>
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
          <label class="text-sm font-medium text-gray-700">Name</label>
          <AppInput v-model="createForm.name" placeholder="Starter" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="createForm.description" rows="3" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Features</label>
          <textarea v-model="createForm.featuresText" rows="4" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="One feature per line" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Price</label>
          <AppInput v-model="createForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Cycle</label>
          <select v-model="createForm.cycle" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
          <textarea v-model="editForm.description" rows="3" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Features</label>
          <textarea v-model="editForm.featuresText" rows="4" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Price</label>
          <AppInput v-model="editForm.price" type="number" min="0" step="0.01" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Cycle</label>
          <select v-model="editForm.cycle" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
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
