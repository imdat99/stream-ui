<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import AppButton from "@/components/app/AppButton.vue";
import AppInput from "@/components/app/AppInput.vue";
import SettingsSectionCard from "@/routes/settings/components/SettingsSectionCard.vue";
import { computed, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

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

const activeChannel = computed(() => activeJobId.value ? `picpic/logs/${activeJobId.value}` : "No active stream");

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

useAdminPageHeader(() => ({
  eyebrow: "Observability",
  badge: activeJobId.value ? "Live tail attached" : "Awaiting job selection",
  actions: [{
    label: "Load logs",
    variant: "secondary",
    onClick: loadLogs,
  }],
}));
</script>

<template>
  <AdminSectionShell>

    <template #stats>
      <div v-for="item in summary" :key="item.label" class="rounded-lg border border-border bg-muted/20 p-4">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">{{ item.label }}</div>
        <div class="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{{ item.value }}</div>
      </div>
    </template>

    <div class="space-y-4">
      <SettingsSectionCard title="Log session" description="Load persisted logs once, then keep appending live lines for the same job." bodyClass="p-5">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">Job ID</label>
            <AppInput v-model="jobId" placeholder="job-..." @enter="loadLogs" />
          </div>
          <div class="flex items-center gap-2">
            <AppButton size="sm" variant="ghost" @click="clearLogs">Reset</AppButton>
            <AppButton size="sm" variant="secondary" :loading="loading" @click="loadLogs">Fetch</AppButton>
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">Current channel</div>
            <div class="mt-1 break-all text-sm font-medium text-foreground">{{ activeChannel }}</div>
          </div>
          <div class="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm leading-6 text-foreground/70">
            Persisted logs are loaded once from gRPC, then appended live from MQTT frames for the same job.
          </div>
        </div>
      </SettingsSectionCard>

      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <SettingsSectionCard title="Runtime output" :description="activeJobId || 'idle'" bodyClass="p-5">
        <div class="rounded-lg border border-slate-200 bg-slate-950 p-4">
          <pre class="min-h-96 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-emerald-300">{{ loading ? 'Loading logs...' : logs }}</pre>
        </div>
      </SettingsSectionCard>
    </div>
  </AdminSectionShell>
</template>
