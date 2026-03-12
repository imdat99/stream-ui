<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListPaymentsResponse = Awaited<ReturnType<typeof rpcClient.listAdminPayments>>;
type AdminPaymentRow = NonNullable<ListPaymentsResponse["payments"]>[number];

const paymentMethodOptions = ["TOPUP", "WALLET"] as const;
const statusOptions = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"] as const;
const statusFilterOptions = ["", ...statusOptions] as const;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPaymentRow[]>([]);
const total = ref(0);
const limit = ref(12);
const page = ref(1);
const selectedRow = ref<AdminPaymentRow | null>(null);
const userFilter = ref("");
const appliedUserFilter = ref("");
const statusFilter = ref<(typeof statusFilterOptions)[number]>("");
const createOpen = ref(false);
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
    if (selectedRow.value?.id) {
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
  statusOpen.value = false;
  actionError.value = null;
};

const applyFilters = async () => {
  page.value = 1;
  appliedUserFilter.value = userFilter.value;
  await loadPayments();
};

const openStatusDialog = (row: AdminPaymentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  statusForm.id = row.id || "";
  statusForm.status = row.status || "PENDING";
  statusOpen.value = true;
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
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

watch(statusFilter, async () => {
  page.value = 1;
  await loadPayments();
});

onMounted(loadPayments);
</script>

<template>
  <AdminSectionShell
    title="Admin Payments"
    description="Track invoices, manual plan activations and state changes with a finance-focused operator view."
    eyebrow="Finance"
    :badge="`${total} total payments`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" @click="loadPayments">Refresh</AppButton>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create payment</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected payment</div>
        <div v-if="selectedRow" class="space-y-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ formatMoney(selectedRow.amount, selectedRow.currency) }}</div>
            <div class="mt-1 text-sm text-slate-400">{{ selectedRow.id }}</div>
          </div>
          <div class="grid gap-3">
            <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
            </div>
          </div>
          <AppButton size="sm" @click="openStatusDialog(selectedRow)">Update status</AppButton>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
          Select a payment to review invoice metadata and push a status change.
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:grid-cols-[220px_220px_auto] xl:items-end">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User filter</label>
          <AppInput v-model="userFilter" placeholder="Optional user id" @enter="applyFilters" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</label>
          <select v-model="statusFilter" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="status in statusFilterOptions" :key="status || 'all'" :value="status">{{ status || 'ALL' }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2 xl:justify-end">
          <AppButton size="sm" variant="ghost" @click="userFilter = ''; appliedUserFilter = ''; statusFilter = ''; loadPayments()">Reset</AppButton>
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
                <th class="px-4 py-3 font-semibold">Payment</th>
                <th class="px-4 py-3 font-semibold">User</th>
                <th class="px-4 py-3 font-semibold">Plan</th>
                <th class="px-4 py-3 font-semibold">Method</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Created</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading payments...</td>
              </tr>
              <tr v-else-if="rows.length === 0" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">No payments matched the current filters.</td>
              </tr>
              <tr v-for="row in rows" :key="row.id" class="border-t border-slate-200 transition-colors hover:bg-slate-50/70" :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''">
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectedRow = row">
                    <div class="font-medium text-slate-900">{{ formatMoney(row.amount, row.currency) }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.id }}</div>
                  </button>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.userEmail || row.userId }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.planName || row.planId || '—' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.paymentMethod || '—' }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="statusBadgeClass(row.status)">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(row.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton size="sm" variant="secondary" @click="openStatusDialog(row)">Update status</AppButton>
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

  <AppDialog v-model:visible="createOpen" title="Create admin payment" maxWidthClass="max-w-lg" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">User ID</label>
          <AppInput v-model="createForm.userId" placeholder="user-id" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Plan ID</label>
          <AppInput v-model="createForm.planId" placeholder="plan-id" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Term months</label>
          <AppInput v-model="createForm.termMonths" type="number" min="1" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Payment method</label>
          <select v-model="createForm.paymentMethod" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option v-for="method in paymentMethodOptions" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Topup amount</label>
          <AppInput v-model="createForm.topupAmount" type="number" min="0" placeholder="Optional" />
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

  <AppDialog v-model:visible="statusOpen" title="Update payment status" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Status</label>
        <select v-model="statusForm.status" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
        </select>
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
