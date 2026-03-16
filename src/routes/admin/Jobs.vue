<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type ListJobsResponse = Awaited<ReturnType<typeof rpcClient.listAdminJobs>>;
type AdminJobRow = NonNullable<ListJobsResponse["jobs"]>[number];

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminJobRow[]>([]);
const selectedRow = ref<AdminJobRow | null>(null);
const selectedLogs = ref("");
const activeAgentFilter = ref("");
const appliedAgentFilter = ref("");
const search = ref("");
const createOpen = ref(false);
const logsOpen = ref(false);
const cancelOpen = ref(false);
const retryOpen = ref(false);

const createForm = reactive({
  command: "",
  image: "alpine",
  userId: "",
  name: "",
  timeLimit: 0,
  priority: 0,
  envText: "",
});

const parseEnvText = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = line.slice(0, separatorIndex).trim();
      const val = line.slice(separatorIndex + 1).trim();
      if (key) acc[key] = val;
      return acc;
    }, {});

const hasEnv = computed(() => Object.keys(parseEnvText(createForm.envText)).length > 0);
const canCreate = computed(() => createForm.command.trim().length > 0);
const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return rows.value;
  return rows.value.filter((row) => {
    return [row.id, row.name, row.userId, row.agentId, row.status]
      .map((value) => String(value || "").toLowerCase())
      .some((value) => value.includes(keyword));
  });
});
const summary = computed(() => [
  { label: "Visible jobs", value: filteredRows.value.length },
  { label: "Running", value: rows.value.filter((row) => matchesStatus(row.status, ["running", "processing"])).length },
  { label: "Queued", value: rows.value.filter((row) => matchesStatus(row.status, ["pending", "queued"])).length },
  { label: "Failures", value: rows.value.filter((row) => matchesStatus(row.status, ["failure", "failed", "cancelled"])).length },
]);
const selectedMeta = computed(() => {
  if (!selectedRow.value) return [];
  return [
    { label: "Status", value: selectedRow.value.status || "—" },
    { label: "Agent", value: selectedRow.value.agentId || "Unassigned" },
    { label: "Priority", value: String(selectedRow.value.priority ?? 0) },
    { label: "Progress", value: formatProgress(selectedRow.value.progress) },
    { label: "User", value: selectedRow.value.userId || "—" },
    { label: "Updated", value: formatDate(selectedRow.value.updatedAt) },
  ];
});

const matchesStatus = (value: string | undefined, candidates: string[]) => {
  const normalized = String(value || "").toLowerCase();
  return candidates.includes(normalized);
};

const isCancelable = (row?: AdminJobRow | null) => matchesStatus(row?.status, ["pending", "queued", "running", "processing"]);
const isRetryable = (row?: AdminJobRow | null) => matchesStatus(row?.status, ["failure", "failed", "cancelled"]);

const resetCreateForm = () => {
  createForm.command = "";
  createForm.image = "alpine";
  createForm.userId = "";
  createForm.name = "";
  createForm.timeLimit = 0;
  createForm.priority = 0;
  createForm.envText = "";
};

const closeDialogs = () => {
  createOpen.value = false;
  logsOpen.value = false;
  cancelOpen.value = false;
  retryOpen.value = false;
  actionError.value = null;
};

const syncSelectedRow = () => {
  if (!selectedRow.value?.id) return;
  const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
  if (fresh) selectedRow.value = fresh;
};

const loadJobs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminJobs({
      offset: 0,
      limit: 50,
      agentId: appliedAgentFilter.value.trim() || undefined,
    });
    rows.value = response.jobs ?? [];
    syncSelectedRow();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin jobs";
  } finally {
    loading.value = false;
  }
};

const applyFilters = async () => {
  appliedAgentFilter.value = activeAgentFilter.value;
  await loadJobs();
};

const loadSelectedLogs = async (jobId: string) => {
  const response = await rpcClient.getAdminJobLogs({ id: jobId });
  selectedLogs.value = response.logs || "No logs available.";
};

const selectRow = async (row: AdminJobRow) => {
  selectedRow.value = row;
  selectedLogs.value = "Loading logs...";
  try {
    await loadSelectedLogs(row.id);
  } catch {
    selectedLogs.value = "No logs available.";
  }
};

const openLogsDialog = async (row: AdminJobRow) => {
  selectedRow.value = row;
  actionError.value = null;
  selectedLogs.value = "Loading logs...";
  logsOpen.value = true;
  try {
    await loadSelectedLogs(row.id);
  } catch (err: any) {
    selectedLogs.value = "";
    actionError.value = err?.message || "Failed to load job logs";
  }
};

const openCancelDialog = (row: AdminJobRow) => {
  selectedRow.value = row;
  actionError.value = null;
  cancelOpen.value = true;
};

const openRetryDialog = (row: AdminJobRow) => {
  selectedRow.value = row;
  actionError.value = null;
  retryOpen.value = true;
};

const submitCreate = async () => {
  if (!canCreate.value) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.createAdminJob({
      command: createForm.command.trim(),
      image: createForm.image.trim() || undefined,
      userId: createForm.userId.trim() || undefined,
      name: createForm.name.trim() || undefined,
      timeLimit: createForm.timeLimit > 0 ? createForm.timeLimit : undefined,
      priority: createForm.priority,
      env: hasEnv.value ? parseEnvText(createForm.envText) : undefined,
    });
    resetCreateForm();
    createOpen.value = false;
    await loadJobs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to create job";
  } finally {
    submitting.value = false;
  }
};

const submitCancel = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.cancelAdminJob({ id: selectedRow.value.id });
    cancelOpen.value = false;
    await loadJobs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to cancel job";
  } finally {
    submitting.value = false;
  }
};

const submitRetry = async () => {
  if (!selectedRow.value?.id) return;
  submitting.value = true;
  actionError.value = null;
  try {
    await rpcClient.retryAdminJob({ id: selectedRow.value.id });
    retryOpen.value = false;
    await loadJobs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to retry job";
  } finally {
    submitting.value = false;
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatProgress = (value?: number) => `${Number(value ?? 0).toFixed(2)}%`;

const statusBadgeClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (["success", "completed", "done"].includes(normalized)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["running", "processing"].includes(normalized)) return "border-sky-200 bg-sky-50 text-sky-700";
  if (["pending", "queued"].includes(normalized)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["failure", "failed", "cancelled"].includes(normalized)) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

useAdminRuntimeMqtt(({ topic, payload }) => {
  if (topic.startsWith("picpic/job/") && payload?.type === "job_update") {
    const update = payload.payload;
    const jobId = update?.job_id;
    const status = update?.status;
    if (!jobId || !status) return;
    const row = rows.value.find((item) => item.id === jobId);
    if (row) {
      row.status = status;
      row.updatedAt = new Date().toISOString();
    } else {
      loadJobs();
    }
  }

  if (topic.startsWith("picpic/logs/") && payload?.job_id) {
    const row = rows.value.find((item) => item.id === payload.job_id);
    if (row && typeof payload.line === "string") {
      row.progress = payload.progress ?? row.progress;
      row.updatedAt = new Date().toISOString();
    }
    if (selectedRow.value?.id === payload.job_id && typeof payload.line === "string") {
      const nextLine = payload.line.endsWith("\n") ? payload.line : `${payload.line}\n`;
      selectedLogs.value = `${selectedLogs.value === "Loading logs..." || selectedLogs.value === "No logs available." ? "" : selectedLogs.value}${nextLine}`;
      selectedRow.value.progress = payload.progress ?? selectedRow.value.progress;
      selectedRow.value.updatedAt = new Date().toISOString();
    }
  }

  if (topic === "picpic/events" && payload?.type === "resource_update") {
    const update = payload.payload;
    if (!update?.agent_id) return;
    rows.value.forEach((row) => {
      if (row.agentId === update.agent_id) {
        row.updatedAt = new Date().toISOString();
      }
    });
  }
});

onMounted(loadJobs);
</script>

<template>
  <AdminSectionShell
    title="Admin Jobs"
    description="Queue visibility, live progress and operator interventions backed by the existing admin runtime contract."
    eyebrow="Runtime"
    :badge="`${rows.length} jobs loaded`"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" :loading="loading" @click="loadJobs">Refresh</AppButton>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create job</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Selected job</div>
        <div v-if="selectedRow" class="space-y-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ selectedRow.name || 'Untitled job' }}</div>
            <div class="mt-1 text-sm text-slate-400">{{ selectedRow.id }}</div>
          </div>
          <div class="grid gap-3">
            <div v-for="item in selectedMeta" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm font-medium text-white">{{ item.value }}</div>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <div class="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <span>Live logs</span>
              <button type="button" class="text-slate-300 transition hover:text-white" @click="openLogsDialog(selectedRow)">Expand</button>
            </div>
            <pre class="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-emerald-300">{{ selectedLogs || 'No logs available.' }}</pre>
          </div>
          <div class="grid gap-2">
            <AppButton size="sm" variant="secondary" @click="openLogsDialog(selectedRow)">Open full logs</AppButton>
            <AppButton v-if="isRetryable(selectedRow)" size="sm" @click="openRetryDialog(selectedRow)">Retry job</AppButton>
            <AppButton v-if="isCancelable(selectedRow)" size="sm" variant="danger" @click="openCancelDialog(selectedRow)">Cancel job</AppButton>
          </div>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm leading-6 text-slate-400">
          Select a job to inspect runtime state and tail logs from the existing MQTT stream.
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 xl:grid-cols-[220px_minmax(0,1fr)_auto] xl:items-end">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent filter</label>
          <AppInput v-model="activeAgentFilter" placeholder="Optional agent id" @enter="applyFilters" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Search</label>
          <AppInput v-model="search" placeholder="Search job id, name, user, agent" />
        </div>
        <div class="flex items-center gap-2 xl:justify-end">
          <AppButton size="sm" variant="ghost" @click="activeAgentFilter = ''; appliedAgentFilter = ''; search = ''; loadJobs()">Reset</AppButton>
          <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50/90 text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Job</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Agent</th>
                <th class="px-4 py-3 font-semibold">Priority</th>
                <th class="px-4 py-3 font-semibold">Progress</th>
                <th class="px-4 py-3 font-semibold">Updated</th>
                <th class="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading jobs...</td>
              </tr>
              <tr v-else-if="filteredRows.length === 0" class="border-t border-slate-200">
                <td colspan="7" class="px-4 py-10 text-center text-slate-500">No jobs matched the current filters.</td>
              </tr>
              <tr v-for="row in filteredRows" :key="row.id" class="border-t border-slate-200 transition-colors hover:bg-slate-50/70" :class="selectedRow?.id === row.id ? 'bg-sky-50/60' : ''">
                <td class="px-4 py-3">
                  <button class="text-left" @click="selectRow(row)">
                    <div class="font-medium text-slate-900">{{ row.name || 'Untitled job' }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ row.id }}</div>
                  </button>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" :class="statusBadgeClass(row.status)">
                    {{ row.status || 'UNKNOWN' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-700">{{ row.agentId || 'Unassigned' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ row.priority ?? 0 }}</td>
                <td class="px-4 py-3 text-slate-700">{{ formatProgress(row.progress) }}</td>
                <td class="px-4 py-3 text-slate-500">{{ formatDate(row.updatedAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <AppButton size="sm" variant="secondary" @click="openLogsDialog(row)">Logs</AppButton>
                    <AppButton v-if="isRetryable(row)" size="sm" @click="openRetryDialog(row)">Retry</AppButton>
                    <AppButton v-if="isCancelable(row)" size="sm" variant="danger" @click="openCancelDialog(row)">Cancel</AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create job" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Command</label>
          <textarea v-model="createForm.command" rows="4" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="ffmpeg -i ..." />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Image</label>
          <AppInput v-model="createForm.image" placeholder="alpine" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Owner user ID</label>
          <AppInput v-model="createForm.userId" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Display name</label>
          <AppInput v-model="createForm.name" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Priority</label>
          <AppInput v-model="createForm.priority" type="number" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Time limit</label>
          <AppInput v-model="createForm.timeLimit" type="number" min="0" placeholder="Seconds" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Environment</label>
          <textarea v-model="createForm.envText" rows="5" class="w-full rounded-md border border-border bg-header px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="KEY=value per line" />
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

  <AppDialog v-model:visible="logsOpen" title="Job logs" maxWidthClass="max-w-4xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-emerald-300 whitespace-pre-wrap max-h-140 overflow-auto">
        {{ selectedLogs || 'No logs available.' }}
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="closeDialogs">Close</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="cancelOpen" title="Cancel job" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Cancel job <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Back</AppButton>
        <AppButton variant="danger" size="sm" :loading="submitting" @click="submitCancel">Cancel job</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="retryOpen" title="Retry job" maxWidthClass="max-w-md" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <p class="text-sm text-gray-700">
        Retry job <span class="font-medium">{{ selectedRow?.name || selectedRow?.id }}</span>.
      </p>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" :disabled="submitting" @click="closeDialogs">Back</AppButton>
        <AppButton size="sm" :loading="submitting" @click="submitRetry">Retry</AppButton>
      </div>
    </template>
  </AppDialog>
</template>
