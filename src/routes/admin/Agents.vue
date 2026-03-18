<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import BaseTable from "@/components/ui/BaseTable.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import SettingsSectionCard from "@/routes/settings/components/SettingsSectionCard.vue";
import SettingsTableSkeleton from "@/routes/settings/components/SettingsTableSkeleton.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListAgentsResponse = Awaited<ReturnType<typeof rpcClient.listAdminAgents>>;
type AdminAgentRow = NonNullable<ListAgentsResponse["agents"]>[number];

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminAgentRow[]>([]);
const selectedRow = ref<AdminAgentRow | null>(null);
const detailOpen = ref(false);
const restartOpen = ref(false);
const updateOpen = ref(false);
let reloadAgentsTimer: ReturnType<typeof setTimeout> | null = null;

const summary = computed(() => [
  { label: "Agents", value: rows.value.length },
  { label: "Online", value: rows.value.filter((row) => matchesStatus(row.status, ["online", "active"])).length },
  { label: "Busy", value: rows.value.reduce((sum, row) => sum + getActiveJobCount(row), 0) },
  { label: "Total capacity", value: rows.value.reduce((sum, row) => sum + Number(row.capacity ?? 0), 0) },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Status", value: selectedRow.value.status || "—" },
    { label: "Platform", value: selectedRow.value.platform || "—" },
    { label: "Version", value: selectedRow.value.version || "—" },
    { label: "Capacity", value: String(selectedRow.value.capacity ?? 0) },
    { label: "Active jobs", value: String(getActiveJobCount(selectedRow.value)) },
    { label: "Heartbeat", value: formatDate(selectedRow.value.lastHeartbeat) },
  ];
});

const matchesStatus = (value: string | undefined, candidates: string[]) => candidates.includes(String(value || "").toLowerCase());
const getActiveJobCount = (row: AdminAgentRow) => Number((row as AdminAgentRow & { activeJobCount?: number; active_job_count?: number }).activeJobCount ?? (row as AdminAgentRow & { activeJobCount?: number; active_job_count?: number }).active_job_count ?? 0);

const loadAgents = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminAgents();
    rows.value = response.agents ?? [];
    if (selectedRow.value?.id) {
      const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
      if (fresh) selectedRow.value = fresh;
    }
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin agents";
  } finally {
    loading.value = false;
  }
};

const closeDialogs = () => {
  detailOpen.value = false;
  restartOpen.value = false;
  updateOpen.value = false;
  actionError.value = null;
};

const scheduleAgentsReload = () => {
  if (loading.value) return;
  if (reloadAgentsTimer) clearTimeout(reloadAgentsTimer);
  reloadAgentsTimer = setTimeout(() => {
    reloadAgentsTimer = null;
    loadAgents();
  }, 300);
};

const openDetailDialog = (row: AdminAgentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  detailOpen.value = true;
};

const openRestartDialog = (row: AdminAgentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  restartOpen.value = true;
};

const openUpdateDialog = (row: AdminAgentRow) => {
  selectedRow.value = row;
  actionError.value = null;
  updateOpen.value = true;
};

const submitRestart = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.restartAdminAgent({ id: selectedRow.value.id });
    restartOpen.value = false;
    await loadAgents();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to restart agent";
  } finally {
    submitting.value = false;
  }
};

const submitUpdate = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.updateAdminAgent({ id: selectedRow.value.id });
    updateOpen.value = false;
    await loadAgents();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update agent";
  } finally {
    submitting.value = false;
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatCpu = (value?: number) => `${Number(value ?? 0).toFixed(1)}%`;
const formatRam = (value?: number) => `${Number(value ?? 0).toFixed(1)} MB`;

const statusBadgeClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (["online", "active"].includes(normalized)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["busy", "updating"].includes(normalized)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["offline", "error", "failed"].includes(normalized)) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-border bg-muted/40 text-foreground/70";
};


const columns = computed<ColumnDef<AdminAgentRow>[]>(() => [
  {
    id: "agent",
    header: "Agent",
    accessorFn: row => row.name || row.id || "",
    cell: ({ row }) => h("button", { class: "text-left", onClick: () => { openDetailDialog(row.original); } }, [
      h("div", { class: "font-medium text-foreground" }, row.original.name || "Unnamed agent"),
      h("div", { class: "mt-1 text-xs text-foreground/60" }, row.original.id),
      h("div", { class: "mt-1 text-xs text-foreground/60" }, `${row.original.platform || "—"} · ${row.original.backend || "—"} · ${row.original.version || "—"}`),
    ]),
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
      class: ["inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", statusBadgeClass(row.original.status)],
    }, row.original.status || "UNKNOWN"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "capacity",
    header: "Capacity",
    accessorFn: row => Number(row.capacity ?? 0),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, String(row.original.capacity ?? 0)),
    meta: { headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50", cellClass: "px-4 py-3 text-right" },
  },
  {
    id: "activeJobCount",
    header: "Active jobs",
    accessorFn: row => getActiveJobCount(row),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, String(getActiveJobCount(row.original))),
    meta: { headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50", cellClass: "px-4 py-3 text-right" },
  },
  {
    id: "cpu",
    header: "CPU",
    accessorFn: row => Number(row.cpu ?? 0),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, formatCpu(row.original.cpu)),
    meta: { headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50", cellClass: "px-4 py-3 text-right" },
  },
  {
    id: "ram",
    header: "RAM",
    accessorFn: row => Number(row.ram ?? 0),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, formatRam(row.original.ram)),
    meta: { headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50", cellClass: "px-4 py-3 text-right" },
  },
  {
    id: "heartbeat",
    header: "Heartbeat",
    accessorFn: row => row.lastHeartbeat || "",
    cell: ({ row }) => h("span", { class: "text-foreground/60" }, formatDate(row.original.lastHeartbeat)),
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
      h(AppButton, { size: "sm", variant: "secondary", onClick: () => openUpdateDialog(row.original) }, { default: () => "Update" }),
      h(AppButton, { size: "sm", variant: "danger", onClick: () => openRestartDialog(row.original) }, { default: () => "Restart" }),
    ]),
    meta: { headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50", cellClass: "px-4 py-3 text-right" },
  },
]);

useAdminRuntimeMqtt(({ topic, payload }) => {
  if (topic !== "picpic/events") return;

  if (payload?.type === "agent_update") {
    const update = payload.payload;
    if (!update?.id) return;
    const row = rows.value.find((item) => item.id === update.id);
    if (row) {
      Object.assign(row, {
        ...row,
        ...update,
        lastHeartbeat: update.last_heartbeat || row.lastHeartbeat,
        createdAt: update.created_at || row.createdAt,
        updatedAt: update.updated_at || row.updatedAt,
      });
    } else {
      loadAgents();
    }
  }

  if (payload?.type === "resource_update") {
    const update = payload.payload;
    if (!update?.agent_id) return;
    const row = rows.value.find((item) => item.id === update.agent_id);
    if (row) {
      row.cpu = update.cpu ?? row.cpu;
      row.ram = update.ram ?? row.ram;
      row.lastHeartbeat = new Date().toISOString();
      row.status = row.status || "online";
    }
  }

  if (payload?.type === "job_update") {
    scheduleAgentsReload();
  }
});

onMounted(loadAgents);
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

      <SettingsSectionCard v-else title="Agents" :description="`${rows.length} agents connected`" bodyClass="">
        <template #header-actions>
          <AppButton size="sm" variant="ghost" @click="loadAgents">Refresh</AppButton>
        </template>
        <SettingsTableSkeleton v-if="loading" :columns="8" :rows="4" />

        <BaseTable
          v-else
          :data="rows"
          :columns="columns"
          :get-row-id="(row) => row.id || row.name || ''"
          wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent"
          tableClass="w-full"
          headerRowClass="bg-muted/30"
          bodyRowClass="border-b border-border hover:bg-muted/30"
        >
          <template #empty>
            <div class="px-6 py-12 text-center">
              <p class="mb-1 text-sm text-foreground/60">No agents connected.</p>
              <p class="text-xs text-foreground/40">Workers will appear here when they register with the admin runtime.</p>
            </div>
          </template>
        </BaseTable>
      </SettingsSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="detailOpen" title="Agent details" maxWidthClass="max-w-lg" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.name || 'Unnamed agent' }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.platform || 'Unknown platform' }} · {{ selectedRow.backend || 'Unknown backend' }}</div>
      </div>

      <div class="grid gap-3">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">CPU</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ formatCpu(selectedRow.cpu) }}</div>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">RAM</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ formatRam(selectedRow.ram) }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="detailOpen = false">Close</AppButton>
        <AppButton size="sm" @click="detailOpen = false; selectedRow && openUpdateDialog(selectedRow)">Update</AppButton>
        <AppButton variant="danger" size="sm" @click="detailOpen = false; selectedRow && openRestartDialog(selectedRow)">Restart</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="restartOpen" title="Restart agent" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Send restart command to <span class="font-medium">{{ selectedRow?.name || 'this agent' }}</span>.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Back</AppButton>
        <AppButton variant="danger" size="sm" :loading="submitting" @click="submitRestart">Restart</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="updateOpen" title="Update agent" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Send update command to <span class="font-medium">{{ selectedRow?.name || 'this agent' }}</span>.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Back</AppButton>
        <AppButton size="sm" :loading="submitting" @click="submitUpdate">Update</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
