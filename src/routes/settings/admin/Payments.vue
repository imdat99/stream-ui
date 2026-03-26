<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AdminInput from "./components/AdminInput.vue";
import AdminSelect from "./components/AdminSelect.vue";
import AdminTable from "./components/AdminTable.vue";
import AdminSectionCard from "./components/AdminSectionCard.vue";
import PlanSelection from "@/routes/settings/Billing/components/PlanSelection.tsx";
import type { Plan as ModelPlan } from "@/server/api/proto/app/v1/common";
import { type ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import AdminMetricCard from "./components/AdminMetricCard.vue";
import AdminPlaceholderTable from "./components/AdminPlaceholderTable.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type ListPaymentsResponse = Awaited<ReturnType<typeof rpcClient.listAdminPayments>>;
type AdminPaymentRow = NonNullable<ListPaymentsResponse["payments"]>[number];

const paymentMethodOptions = ["TOPUP", "WALLET"] as const;
const statusOptions = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"] as const;
const statusFilterOptions = ["", ...statusOptions] as const;

const loading = ref(true);
const plansLoading = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPaymentRow[]>([]);
const plans = ref<ModelPlan[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminPaymentRow | null>(null);
const userFilter = ref("");
const appliedUserFilter = ref("");
const statusFilter = ref<(typeof statusFilterOptions)[number]>("");
const createOpen = ref(false);
const detailOpen = ref(false);
const statusOpen = ref(false);

const createForm = reactive({
  userId: "",
  planId: "",
  termMonths: 1,
  paymentMethod: "TOPUP",
  topupAmount: null as number | null,
});

const statusForm = reactive({
  id: "",
  status: "PENDING",
});

const canCreate = computed(() => createForm.userId.trim() && createForm.planId.trim() && createForm.termMonths >= 1 && createForm.paymentMethod.trim());
const canUpdateStatus = computed(() => statusForm.id.trim() && statusForm.status.trim());
const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / limit.value)));
const selectedPlanId = computed(() => createForm.planId || undefined);
const summary = computed(() => [
  { label: "Visible payments", value: rows.value.length },
  { label: "Successful", value: rows.value.filter((row) => row.status === "SUCCESS").length },
  { label: "Pending", value: rows.value.filter((row) => row.status === "PENDING").length },
  { label: "Total records", value: total.value },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "User", value: selectedRow.value.userEmail || selectedRow.value.userId || "—" },
    { label: "Plan", value: selectedRow.value.planName || selectedRow.value.planId || "—" },
    { label: "Method", value: selectedRow.value.paymentMethod || "—" },
    { label: "Amount", value: formatMoney(selectedRow.value.amount, selectedRow.value.currency) },
    { label: "Created", value: formatDate(selectedRow.value.createdAt) },
    { label: "Invoice", value: selectedRow.value.invoiceId || "—" },
  ];
});

const loadPlans = async () => {
  plansLoading.value = true;
  try {
    const response = await rpcClient.listPlans();
    plans.value = response.plans ?? [];
  } finally {
    plansLoading.value = false;
  }
};

const loadPayments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPayments({
      page: page.value,
      limit: limit.value,
      userId: appliedUserFilter.value.trim() || undefined,
      status: statusFilter.value || undefined,
    });
    rows.value = response.payments ?? [];
    total.value = response.total ?? rows.value.length;
    limit.value = response.limit ?? limit.value;
    page.value = response.page ?? page.value;
    if (selectedRow.value?.id && (detailOpen.value || statusOpen.value)) {
      const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
      if (fresh) selectedRow.value = fresh;
    }
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin payments";
  } finally {
    loading.value = false;
  }
};

const resetCreateForm = () => {
  createForm.userId = "";
  createForm.planId = "";
  createForm.termMonths = 1;
  createForm.paymentMethod = "TOPUP";
  createForm.topupAmount = null;
};

const closeDialogs = () => {
  createOpen.value = false;
  detailOpen.value = false;
  statusOpen.value = false;
  actionError.value = null;
};

const applyFilters = async () => {
  page.value = 1;
  appliedUserFilter.value = userFilter.value;
  await loadPayments();
};

const openDetailDialog = (row: AdminPaymentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  detailOpen.value = true;
};

const openStatusDialog = (row: AdminPaymentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  statusForm.id = row.id || "";
  statusForm.status = row.status || "PENDING";
  statusOpen.value = true;
};

const selectPlan = (plan: ModelPlan) => {
  createForm.planId = plan.id || "";
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminPayment({
      userId: createForm.userId.trim(),
      planId: createForm.planId.trim(),
      termMonths: createForm.termMonths,
      paymentMethod: createForm.paymentMethod,
      topupAmount: createForm.topupAmount == null ? undefined : createForm.topupAmount,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadPayments();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create payment";
  } finally {
    submitting.value = false;
  }
};

const submitStatusUpdate = async () => {
  if (!canUpdateStatus.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminPayment({
      id: statusForm.id,
      status: statusForm.status,
    });
    statusOpen.value = false;
    await loadPayments();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update payment";
  } finally {
    submitting.value = false;
  }
};

const previousPage = async () => {
  if (page.value <= 1) return;
  page.value -= 1;
  await loadPayments();
};

const nextPage = async () => {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  await loadPayments();
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatMoney = (amount?: number, currency?: string) => `${amount ?? 0} ${currency || "USD"}`;

const formatBytes = (bytes?: number) => {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), sizes.length - 1);
  const normalized = value / 1024 ** index;
  return `${normalized.toFixed(index === 0 ? 0 : 1)} ${sizes[index]}`;
};

const formatDuration = (seconds?: number) => {
  const value = Number(seconds || 0);
  if (!value) return "0 min";
  if (value < 0) return "∞";
  return `${Math.floor(value / 60)} min`;
};

const getPlanStorageText = (plan: ModelPlan) => `Storage ${formatBytes(plan.storageLimit || 0)}`;
const getPlanDurationText = (plan: ModelPlan) => `Duration ${formatDuration(plan.durationLimit)}`;
const getPlanUploadsText = (plan: ModelPlan) => `Uploads ${plan.uploadLimit || 0}`;

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case "SUCCESS":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-border bg-muted/40 text-foreground/70";
  }
};

useAdminPageHeader(() => ({
  eyebrow: 'Finance',
  badge: loading.value ? 'Syncing payment records' : `${total.value} payment records`,
  actions: [
    {
      label: 'Refresh',
      variant: 'secondary',
      loading: loading.value,
      onClick: loadPayments,
    },
    {
      label: 'Create payment',
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

const columns = computed<ColumnDef<AdminPaymentRow>[]>(() => [
  {
    id: "payment",
    header: "Payment",
    accessorFn: row => row.invoiceId || row.id || "",
    cell: ({ row }) => h("button", { class: "text-left", onClick: () => { openDetailDialog(row.original); } }, [
      h("div", { class: "font-medium text-foreground" }, formatMoney(row.original.amount, row.original.currency)),
      h("div", { class: "mt-1 text-xs text-foreground/60" }, row.original.planName || row.original.planId || "No plan"),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "user",
    header: "User",
    accessorFn: row => row.userEmail || row.userId || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.userEmail || row.original.userId || "—"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "plan",
    header: "Plan",
    accessorFn: row => row.planName || row.planId || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.planName || row.original.planId || "—"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "method",
    header: "Method",
    accessorFn: row => row.paymentMethod || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.paymentMethod || "—"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "status",
    header: "Status",
    accessorFn: row => row.status || "",
    cell: ({ row }) => h("span", {
      class: ["inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ", statusBadgeClass(row.original.status)],
    }, row.original.status || "UNKNOWN"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "created",
    header: "Created",
    accessorFn: row => row.createdAt || "",
    cell: ({ row }) => h("span", { class: "text-foreground/60" }, formatDate(row.original.createdAt)),
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
      h(AppButton, { size: "sm", variant: "secondary", onClick: () => openStatusDialog(row.original) }, { default: () => "Update status" }),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
]);

watch(statusFilter, async () => {
  page.value = 1;
  await loadPayments();
});

onMounted(() => {
  void loadPlans();
  void loadPayments();
});
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
      <AdminSectionCard title="Filters" description="Filter payments by user reference and status." bodyClass="p-5">
        <div class="grid gap-3 xl:grid-cols-[220px_220px_auto] xl:items-end">
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">User reference</label>
            <AdminInput v-model="userFilter" placeholder="Optional user reference" @enter="applyFilters" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">Status</label>
            <AdminSelect v-model="statusFilter">
              <option v-for="status in statusFilterOptions" :key="status || 'all'" :value="status">{{ status || 'ALL' }}</option>
            </AdminSelect>
          </div>
          <div class="flex items-center gap-2 xl:justify-end">
            <AppButton size="sm" variant="ghost" @click="userFilter = ''; appliedUserFilter = ''; statusFilter = ''; loadPayments()">Reset</AppButton>
            <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
          </div>
        </div>
      </AdminSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <AdminSectionCard v-else title="Payments" description="Payment records and status operations." bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="7" :rows="4" />

        <AdminTable
          v-else
          :data="rows"
          :columns="columns"
          :get-row-id="(row) => row.id || row.invoiceId || ''"
          wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent"
          tableClass="w-full"
          headerRowClass="bg-muted/30"
          bodyRowClass="border-b border-border hover:bg-muted/30"
        >
          <template #empty>
            <div class="px-6 py-12 text-center">
              <p class="mb-1 text-sm text-foreground/60">No payments matched the current filters.</p>
              <p class="text-xs text-foreground/40">Try a broader user reference or clear the status filter.</p>
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

  <AppDialog v-model:visible="detailOpen" title="Payment details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ formatMoney(selectedRow.amount, selectedRow.currency) }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.planName || selectedRow.planId || 'No plan linked' }}</div>
      </div>

      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="detailOpen = false">Close</AppButton>
        <AppButton size="sm" @click="detailOpen = false; selectedRow && openStatusDialog(selectedRow)">Update status</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="createOpen" title="Create admin payment" maxWidthClass="max-w-4xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">User ID</label>
          <AdminInput v-model="createForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Term months</label>
          <AdminInput v-model="createForm.termMonths" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Payment method</label>
          <AdminSelect v-model="createForm.paymentMethod">
            <option v-for="method in paymentMethodOptions" :key="method" :value="method">{{ method }}</option>
          </AdminSelect>
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Topup amount</label>
          <AdminInput v-model="createForm.topupAmount" type="number" min="0" placeholder="Optional" />
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border border-border">
        <PlanSelection
          :current-plan-id="selectedPlanId"
          :selected-plan-id="selectedPlanId"
          @upgrade="selectPlan"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canCreate" @click="submitCreate">Create</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="statusOpen" title="Update payment status" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground/70">Status</label>
        <AdminSelect v-model="statusForm.status">
          <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </AdminSelect>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Cancel</AppButton>
        <AppButton size="sm" :loading="submitting" :disabled="!canUpdateStatus" @click="submitStatusUpdate">Save</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
