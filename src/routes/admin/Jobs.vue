<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import AppInput from "@/components/app/AppInput.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import { computed, onMounted, reactive, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminJobRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminJobRow[]>([]);
const selectedRow = ref<AdminJobRow | null>(null);
const selectedLogs = ref("");
const createOpen = ref(false);
const logsOpen = ref(false);
const cancelOpen = ref(false);
const retryOpen = ref(false);
const activeAgentFilter = ref("");

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
      if (key) {
        acc[key] = val;
      }
      return acc;
    }, {});

const hasEnv = computed(() => Object.keys(parseEnvText(createForm.envText)).length > 0);
const canCreate = computed(() => createForm.command.trim().length > 0);

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
  selectedRow.value = null;
  selectedLogs.value = "";
  actionError.value = null;
};

const loadJobs = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminJobs({
      offset: 0,
      limit: 50,
      agentId: activeAgentFilter.value.trim() || undefined,
    });
    rows.value = response.jobs ?? [];
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin jobs";
  } finally {
    loading.value = false;
  }
};

const openLogsDialog = async (row: AdminJobRow) => {
  selectedRow.value = row;
  actionError.value = null;
  selectedLogs.value = "Loading logs...";
  logsOpen.value = true;
  try {
    const response = await rpcClient.getAdminJobLogs({ id: row.id });
    selectedLogs.value = response.logs || "No logs available.";
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
    selectedRow.value = null;
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
    selectedRow.value = null;
    await loadJobs();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to retry job";
  } finally {
    submitting.value = false;
  }
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
      row.logs = `${row.logs || ""}${payload.line.endsWith("\n") ? payload.line : `${payload.line}\n`}`;
      row.progress = payload.progress ?? row.progress;
    }
    if (selectedRow.value?.id === payload.job_id && typeof payload.line === "string") {
      const nextLine = payload.line.endsWith("\n") ? payload.line : `${payload.line}\n`;
      selectedLogs.value = `${selectedLogs.value === "Loading logs..." ? "" : selectedLogs.value}${nextLine}`;
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
    description="Runtime job queue over admin gRPC service."
  >
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="w-full max-w-sm space-y-2">
        <label class="text-sm font-medium text-gray-700">Filter by agent ID</label>
        <div class="flex gap-2">
          <AppInput v-model="activeAgentFilter" placeholder="Optional agent ID" />
          <AppButton size="sm" variant="secondary" @click="loadJobs">Apply</AppButton>
        </div>
      </div>
      <AppButton size="sm" @click="actionError = null; createOpen = true">Create job</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">Name</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 font-medium">Agent</th>
            <th class="py-3 pr-4 font-medium">Priority</th>
            <th class="py-3 pr-4 font-medium">Progress</th>
            <th class="py-3 pr-4 font-medium">Updated</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">Loading jobs...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="7" class="py-6 text-center text-gray-500">No jobs found.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">
              <div class="font-medium">{{ row.name || row.id }}</div>
              <div class="text-xs text-gray-500">{{ row.id }}</div>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ row.status }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.agentId || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.priority }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.progress || 0 }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—' }}</td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <AppButton size="sm" variant="secondary" @click="openLogsDialog(row)">Logs</AppButton>
                <AppButton size="sm" variant="secondary" @click="openRetryDialog(row)">Retry</AppButton>
                <AppButton size="sm" variant="danger" @click="openCancelDialog(row)">Cancel</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminSectionShell>

  <AppDialog v-model:visible="createOpen" title="Create job" maxWidthClass="max-w-2xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2 md:col-span-2">
          <label class="text-sm font-medium text-gray-700">Command</label>
          <AppInput v-model="createForm.command" placeholder="ffmpeg -i ..." />
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
          <textarea v-model="createForm.envText" rows="5" class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="KEY=value per line" />
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

  <AppDialog v-model:visible="logsOpen" title="Job logs" maxWidthClass="max-w-3xl" @close="actionError = null">
    <div class="space-y-4">
      <div v-if="actionError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ actionError }}</div>
      <div class="rounded-lg border border-gray-200 bg-gray-950 p-4 font-mono text-xs text-green-300 whitespace-pre-wrap max-h-120 overflow-auto">
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
