<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/ui/AppButton.vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import AdminInput from "./components/AdminInput.vue";
import AdminTextarea from "./components/AdminTextarea.vue";
import AdminTable from "./components/AdminTable.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import AdminSectionCard from "./components/AdminSectionCard.vue";
import { type ColumnDef } from "@tanstack/vue-table";
import { computed, h, onMounted, reactive, ref } from "vue";
import AdminMetricCard from "./components/AdminMetricCard.vue";
import AdminPlaceholderTable from "./components/AdminPlaceholderTable.vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type ListJobsResponse = Awaited<ReturnType<typeof rpcClient.listAdminJobs>>;
type AdminJobRow = NonNullable<ListJobsResponse["jobs"]>[number];

const loading = ref(true);
const loadingMore = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminJobRow[]>([]);
const nextCursor = ref<string | undefined>(undefined);
const hasMore = ref(false);
const selectedRow = ref<AdminJobRow | null>(null);
const selectedLogs = ref("");
const activeAgentFilter = ref("");
const appliedAgentFilter = ref("");
const search = ref("");
const createOpen = ref(false);
const detailOpen = ref(false);
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
    return [row.name, row.status]
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
    { label: "Owner", value: selectedRow.value.userId || "—" },
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
  detailOpen.value = false;
  logsOpen.value = false;
  cancelOpen.value = false;
  retryOpen.value = false;
  actionError.value = null;
};

const syncSelectedRow = () => {
  if (!selectedRow.value?.id) return;
  const fresh = rows.value.find((row) => row.id === selectedRow.value?.id);
  if (fresh && (detailOpen.value || logsOpen.value || cancelOpen.value || retryOpen.value)) selectedRow.value = fresh;
};

const loadJobs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminJobs({
      cursor: undefined,
      pageSize: 50,
      agentId: appliedAgentFilter.value.trim() || undefined,
    });
    rows.value = response.jobs ?? [];
    nextCursor.value = response.nextCursor || undefined;
    hasMore.value = Boolean(response.hasMore);
    syncSelectedRow();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin jobs";
  } finally {
    loading.value = false;
  }
};

const loadMoreJobs = async () => {
  if (loading.value || loadingMore.value || !hasMore.value || !nextCursor.value) return;
  loadingMore.value = true;
  actionError.value = null;
  try {
    const response = await rpcClient.listAdminJobs({
      cursor: nextCursor.value,
      pageSize: 50,
      agentId: appliedAgentFilter.value.trim() || undefined,
    });
    rows.value = [...rows.value, ...(response.jobs ?? [])];
    nextCursor.value = response.nextCursor || undefined;
    hasMore.value = Boolean(response.hasMore);
    syncSelectedRow();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to load more jobs";
  } finally {
    loadingMore.value = false;
  }
};

const applyFilters = async () => {
  appliedAgentFilter.value = activeAgentFilter.value;
  nextCursor.value = undefined;
  hasMore.value = false;
  await loadJobs();
};

const loadSelectedLogs = async (jobId: string) => {
  const response = await rpcClient.getAdminJobLogs({ id: jobId });
  selectedLogs.value = response.logs || "No logs available.";
};

const openDetailDialog = async (row: AdminJobRow) => {
  selectedRow.value = row;
  actionError.value = null;
  selectedLogs.value = "Loading logs...";
  detailOpen.value = true;
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
  return "border-border bg-muted/40 text-foreground/70";
};

const columns = computed<ColumnDef<AdminJobRow>[]>(() => [
  {
    id: "job",
    header: "Job",
    accessorFn: row => row.name || row.id || "",
    cell: ({ row }) => h("button", { class: "text-left", onClick: () => { openDetailDialog(row.original); } }, [
      h("div", { class: "font-medium text-foreground" }, row.original.name || "Untitled job"),
      h("div", { class: "mt-1 text-xs text-foreground/60" }, row.original.status || "Unknown status"),
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
      class: ["inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ", statusBadgeClass(row.original.status)],
    }, row.original.status || "UNKNOWN"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "agent",
    header: "Agent",
    accessorFn: row => row.agentId || "",
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, row.original.agentId || "Unassigned"),
    meta: {
      headerClass: "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3",
    },
  },
  {
    id: "priority",
    header: "Priority",
    accessorFn: row => Number(row.priority ?? 0),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, String(row.original.priority ?? 0)),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
  {
    id: "progress",
    header: "Progress",
    accessorFn: row => Number(row.progress ?? 0),
    cell: ({ row }) => h("span", { class: "text-foreground/70" }, formatProgress(row.original.progress)),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
  {
    id: "updated",
    header: "Updated",
    accessorFn: row => row.updatedAt || "",
    cell: ({ row }) => h("span", { class: "text-foreground/60" }, formatDate(row.original.updatedAt)),
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
      h(AppButton, { size: "sm", variant: "secondary", onClick: () => openLogsDialog(row.original) }, { default: () => "Logs" }),
      ...(isRetryable(row.original)
        ? [h(AppButton, { size: "sm", onClick: () => openRetryDialog(row.original) }, { default: () => "Retry" })]
        : []),
      ...(isCancelable(row.original)
        ? [h(AppButton, { size: "sm", variant: "danger", onClick: () => openCancelDialog(row.original) }, { default: () => "Cancel" })]
        : []),
    ]),
    meta: {
      headerClass: "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground/50",
      cellClass: "px-4 py-3 text-right",
    },
  },
]);

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

useAdminPageHeader(() => ({
  eyebrow: 'Runtime',
  badge: loading.value ? 'Polling queue state' : `${rows.value.length} jobs loaded`,
  actions: [
    {
      label: 'Refresh',
      variant: 'secondary',
      loading: loading.value,
      onClick: loadJobs,
    },
    {
      label: 'Create job',
      onClick: () => {
        actionError.value = null;
        createOpen.value = true;
      },
    },
  ],
}));

onMounted(loadJobs);
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
      <AdminSectionCard title="Filters" description="Find jobs by name or status, then narrow the list by assigned agent if needed." bodyClass="p-5">
        <div class="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_auto] xl:items-end">
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">Assigned agent</label>
            <AdminInput v-model="activeAgentFilter" placeholder="Optional agent reference" @enter="applyFilters" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-foreground/60">Search</label>
            <AdminInput v-model="search" placeholder="Search by job name or status" />
          </div>
          <div class="flex items-center gap-2 xl:justify-end">
            <AppButton size="sm" variant="ghost" @click="activeAgentFilter = ''; appliedAgentFilter = ''; search = ''; nextCursor = undefined; hasMore = false; loadJobs()">Reset</AppButton>
            <AppButton size="sm" variant="secondary" @click="applyFilters">Apply</AppButton>
          </div>
        </div>
      </AdminSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <AdminSectionCard v-else title="Jobs" description="Current queue state and operator actions." bodyClass="">
        <AdminPlaceholderTable v-if="loading" :columns="7" :rows="4" />

        <div v-else>
          <AdminTable
            :data="filteredRows"
            :columns="columns"
            :get-row-id="(row) => row.id || row.name || ''"
            wrapperClass="border-x-0 border-t-0 rounded-none bg-transparent"
            tableClass="w-full"
            headerRowClass="bg-muted/30"
            bodyRowClass="border-b border-border hover:bg-muted/30"
          >
            <template #empty>
              <div class="px-6 py-12 text-center">
                <p class="mb-1 text-sm text-foreground/60">No jobs matched the current filters.</p>
                <p class="text-xs text-foreground/40">Try a broader job name or clear the agent filter.</p>
              </div>
            </template>
          </AdminTable>

          <div class="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p class="text-xs text-foreground/50">{{ hasMore ? 'More jobs available.' : 'Showing the latest jobs.' }}</p>
            <AppButton v-if="hasMore" size="sm" variant="secondary" :loading="loadingMore" @click="loadMoreJobs">Load more</AppButton>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="detailOpen" title="Job details" maxWidthClass="max-w-3xl" @close="actionError = null">
    <div v-if="selectedRow" class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-foreground">{{ selectedRow.name || 'Untitled job' }}</div>
        <div class="mt-1 text-sm text-foreground/60">{{ selectedRow.status || 'Unknown status' }}</div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="item in selectedMeta" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
          <div class="mt-1 text-sm font-medium text-foreground">{{ item.value }}</div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-slate-950 px-4 py-3">
        <div class="flex items-center justify-between gap-2 text-[11px]  text-slate-400">
          <span>Live logs</span>
          <button type="button" class="text-slate-300 transition hover:text-white" @click="selectedRow && openLogsDialog(selectedRow)">Open full logs</button>
        </div>
        <pre class="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-emerald-300">{{ selectedLogs || 'No logs available.' }}</pre>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" size="sm" @click="detailOpen = false">Close</AppButton>
        <AppButton v-if="selectedRow && isRetryable(selectedRow)" size="sm" @click="detailOpen = false; openRetryDialog(selectedRow)">Retry</AppButton>
        <AppButton v-if="selectedRow && isCancelable(selectedRow)" variant="danger" size="sm" @click="detailOpen = false; openCancelDialog(selectedRow)">Cancel</AppButton>
      </div>
    </template>
  </AppDialog>

  <AppDialog v-model:visible="createOpen" title="Create job" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Command</label>
          <AdminTextarea v-model="createForm.command" rows="4" placeholder="ffmpeg -i ..." />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Image</label>
          <AdminInput v-model="createForm.image" placeholder="alpine" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Owner user ID</label>
          <AdminInput v-model="createForm.userId" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Display name</label>
          <AdminInput v-model="createForm.name" placeholder="Optional" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/70">Priority</label>
          <AdminInput v-model="createForm.priority" type="number" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Time limit</label>
          <AdminInput v-model="createForm.timeLimit" type="number" min="0" placeholder="Seconds" />
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-foreground/70">Environment</label>
          <AdminTextarea v-model="createForm.envText" rows="5" placeholder="KEY=value per line" />
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
      <p class="text-sm text-foreground/70">
        Cancel <span class="font-medium">{{ selectedRow?.name || 'this job' }}</span>.
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
      <p class="text-sm text-foreground/70">
        Retry <span class="font-medium">{{ selectedRow?.name || 'this job' }}</span>.
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
