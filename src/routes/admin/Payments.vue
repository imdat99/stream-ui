<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminPaymentRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminPaymentRow[]>([]);
const selectedRow = ref<AdminPaymentRow | null>(null);
const createOpen = ref(false);
const statusOpen = ref(false);

const paymentMethodOptions = ["TOPUP", "WALLET"];
const statusOptions = ["PENDING", "SUCCESS", "FAILED", "CANCELLED"];

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

const loadPayments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminPayments({ page: 1, limit: 20 });
    rows.value = response.payments ?? [];
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
  selectedRow.value = null;
  actionError.value = null;
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
    selectedRow.value = null;
    await loadPayments();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update payment";
  } finally {
    submitting.value = false;
  }
};

onMounted(loadPayments);
</script>

<template>
  <AdminSectionShell
    title="Admin Payments"
    description="Payment history from admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create payment</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">ID</th>
            <th class="py-3 pr-4 font-medium">User</th>
            <th class="py-3 pr-4 font-medium">Amount</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 font-medium">Plan</th>
            <th class="py-3 pr-4 font-medium">Method</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">Loading payments...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">No payments found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">{{ row.id }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.userEmail || row.userId }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.amount }} {{ row.currency }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.status }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.planName || row.planId || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.paymentMethod || '—' }}</td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <AppButton size="sm" variant="secondary" @click="openStatusDialog(row)">Update status</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
