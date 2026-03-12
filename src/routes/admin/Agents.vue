<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import { computed, onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListAgentsResponse = Awaited<ReturnType<typeof rpcClient.listAdminAgents>>;
type AdminAgentRow = NonNullable<ListAgentsResponse["agents"]>[number];

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminAgentRow[]>([]);
const selectedRow = ref<AdminAgentRow | null>(null);
const restartOpen = ref(false);
const updateOpen = ref(false);
let reloadAgentsTimer: ReturnType<typeof setTimeout> | null = null;

const summary = computed(() => [
  { label: "Agents", value: rows.value.length },
  { label: "Online", value: rows.value.filter((row) => matchesStatus(row.status, ["online", "active"])).length },
  { label: "Busy", value: rows.value.reduce((sum, row) => sum + Number(row.activeJobCount ?? 0), 0) },
  { label: "Total capacity", value: rows.value.reduce((sum, row) => sum + Number(row.capacity ?? 0), 0) },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Status", value: selectedRow.value.status || "—" },
    { label: "Platform", value: selectedRow.value.platform || "—" },
    { label: "Version", value: selectedRow.value.version || "—" },
    { label: "Capacity", value: String(selectedRow.value.capacity ?? 0) },
    { label: "Active jobs", value: String(selectedRow.value.activeJobCount ?? 0) },
    { label: "Heartbeat", value: formatDate(selectedRow.value.lastHeartbeat) },
  ];
});

const matchesStatus = (value: string | undefined, candidates: string[]) => candidates.includes(String(value || "").toLowerCase());

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
  return "border-slate-200 bg-slate-100 text-slate-700";
};

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
  <AdminSectionShell
    title="Admin Agents"
    description="Watch worker health, capacity and maintenance actions while staying on the current admin runtime transport."
    eyebrow="Workers"
    :badge="`${rows.length} agents connected`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" :loading="loading" @click="loadAgents">Refresh agents</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected agent</div>
        <div v-if="selectedRow" class="space-y-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ selectedRow.name || 'Unnamed agent' }}</div>
            <div class="mt-1 text-sm text-slate-400">{{ selectedRow.id }}</div>
          </div>
          <div class="grid gap-3">
            <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">CPU</div>
              <div class="mt-1 text-sm font-medium text-white">{{ formatCpu(selectedRow.cpu) }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">RAM</div>
              <div class="mt-1 text-sm font-medium text-white">{{ formatRam(selectedRow.ram) }}</div>
            </div>
          </div>
          <div class="grid gap-2">
            <AppButton size="sm" @click="openUpdateDialog(selectedRow)">Update agent</AppButton>
            <AppButton size="sm" variant="danger" @click="openRestartDialog(selectedRow)">Restart agent</AppButton>
          </div>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
          Select an agent to inspect heartbeat, capacity and dispatch maintenance commands.
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50/90 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Agent</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold text-right">Capacity</th>
                <th class="px-4 py-3 font-semibold text-right">Active jobs</th>
                <th class="px-4 py-3 font-semibold text-right">CPU</th>
                <th class="px-4 py-3 font-semibold text-right">RAM</th>
                <th class="px-4 py-3 font-semibold">Heartbeat</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="8" class="px-4 py-10 text-center text-slate-500">Loading agents...</td>
              </tr>
              <tr v-else-if="rows.length === 0" class="border-t border-slate-200">
                <td colspan="8" class="px-4 py-10 text-center text-slate-500">No agents connected.</td>
              </tr>
              <tr v-for="row in rows" :key="row.id" class="border-t border-slate-200 transition-colors hover:bg-slate-50/70" :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''">
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectedRow = row">
                    <div class="font-medium text-slate-900">{{ row.name || 'Unnamed agent' }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.id }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.platform || '—' }} · {{ row.backend || '—' }} · {{ row.version || '—' }}</div>
                  </button>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="statusBadgeClass(row.status)">
                    {{ row.status || 'UNKNOWN' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-slate-700">{{ row.capacity ?? 0 }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ row.activeJobCount ?? 0 }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatCpu(row.cpu) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">{{ formatRam(row.ram) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(row.lastHeartbeat) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton size="sm" variant="secondary" @click="openUpdateDialog(row)">Update</AppButton>
                    <AppButton size="sm" variant="danger" @click="openRestartDialog(row)">Restart</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="restartOpen" title="Restart agent" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Send restart command to <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
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
        Send update command to <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
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
