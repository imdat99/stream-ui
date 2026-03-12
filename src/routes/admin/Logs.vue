<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import AppButton from "@/components/app/AppButton.vue";
import AppInput from "@/components/app/AppInput.vue";
import { computed, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const jobId = ref("");
const activeJobId = ref("");
const logs = ref("Enter a job ID and load logs.");
const liveLineCount = ref(0);

const countLogLines = (value: string) => value.split("\n").filter(Boolean).length;

const summary = computed(() => [
  { label: "Tracking job", value: activeJobId.value || "—" },
  { label: "Live lines", value: liveLineCount.value },
]);

const loadLogs = async () => {
  if (!jobId.value.trim()) return;
  loading.value = true;
  error.value = null;
  try {
    activeJobId.value = jobId.value.trim();
    const response = await rpcClient.getAdminJobLogs({ id: activeJobId.value });
    logs.value = response.logs || "No logs available.";
    liveLineCount.value = logs.value === "No logs available." ? 0 : countLogLines(logs.value);
  } catch (err: any) {
    error.value = err?.message || "Failed to load logs";
    logs.value = "";
    activeJobId.value = "";
    liveLineCount.value = 0;
  } finally {
    loading.value = false;
  }
};

const clearLogs = () => {
  jobId.value = "";
  activeJobId.value = "";
  error.value = null;
  logs.value = "Enter a job ID and load logs.";
  liveLineCount.value = 0;
};

useAdminRuntimeMqtt(({ topic, payload }) => {
  if (!activeJobId.value) return;
  if (topic === `picpic/logs/${activeJobId.value}` && payload?.job_id === activeJobId.value && typeof payload.line === "string") {
    const nextLine = payload.line.endsWith("\n") ? payload.line : `${payload.line}\n`;
    logs.value = `${logs.value === "Enter a job ID and load logs." || logs.value === "No logs available." ? "" : logs.value}${nextLine}`;
    liveLineCount.value += countLogLines(nextLine);
  }
});
</script>

<template>
  <AdminSectionShell
    title="Admin Logs"
    description="Fetch persisted output and continue tailing the selected job over the existing MQTT log stream."
    eyebrow="Observability"
    :badge="activeJobId ? 'Live tail attached' : 'Awaiting job selection'"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" :loading="loading" @click="loadLogs">Load logs</AppButton>
    </template>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</div>
        <div class="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950">{{ item.value }}</div>
      </div>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Tail status</div>
        <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">Current channel</div>
          <div class="mt-1 break-all text-sm font-medium text-white">{{ activeJobId ? `picpic/logs/${activeJobId}` : 'No active stream' }}</div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
          Persisted logs are loaded once from gRPC, then appended live from MQTT frames for the same job.
        </div>
        <AppButton size="sm" variant="secondary" @click="clearLogs">Clear session</AppButton>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:flex-row lg:items-end">
        <div class="w-full max-w-xl space-y-2">
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Job ID</label>
          <AppInput v-model="jobId" placeholder="job-..." @enter="loadLogs" />
        </div>
        <div class="flex items-center gap-2">
          <AppButton size="sm" variant="ghost" @click="clearLogs">Reset</AppButton>
          <AppButton size="sm" variant="secondary" :loading="loading" @click="loadLogs">Fetch</AppButton>
        </div>
      </div>

      <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="rounded-[24px] border border-slate-200 bg-slate-950 p-4 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.6)]">
        <div class="mb-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
          <span>Runtime output</span>
          <span>{{ activeJobId || 'idle' }}</span>
        </div>
        <pre class="min-h-96 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-emerald-300">{{ loading ? 'Loading logs...' : logs }}</pre>
      </div>
    </div>
  </AdminSectionShell>
</template>
