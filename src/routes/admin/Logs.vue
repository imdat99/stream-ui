<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import AppButton from "@/components/app/AppButton.vue";
import AppInput from "@/components/app/AppInput.vue";
import { ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const jobId = ref("");
const logs = ref("Enter a job ID and load logs.");

const loadLogs = async () => {
  if (!jobId.value.trim()) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.getAdminJobLogs({ id: jobId.value.trim() });
    logs.value = response.logs || "No logs available.";
  } catch (err: any) {
    error.value = err?.message || "Failed to load logs";
    logs.value = "";
  } finally {
    loading.value = false;
  }
};

useAdminRuntimeMqtt(({ topic, payload }) => {
  if (!jobId.value.trim()) return;
  if (topic === `picpic/logs/${jobId.value.trim()}` && payload?.job_id === jobId.value.trim() && typeof payload.line === "string") {
    const nextLine = payload.line.endsWith("\n") ? payload.line : `${payload.line}\n`;
    logs.value = `${logs.value === "Enter a job ID and load logs." ? "" : logs.value}${nextLine}`;
  }
});
</script>

<template>
  <AdminSectionShell
    title="Admin Logs"
    description="Fetch persisted logs by job ID over admin gRPC service."
  >
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
      <div class="w-full max-w-xl space-y-2">
        <label class="text-sm font-medium text-gray-700">Job ID</label>
        <AppInput v-model="jobId" placeholder="job-..." />
      </div>
      <AppButton size="sm" :loading="loading" @click="loadLogs">Load logs</AppButton>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="rounded-xl border border-gray-200 bg-gray-950 p-4 font-mono text-sm text-green-300 whitespace-pre-wrap min-h-80 overflow-auto">
      {{ loading ? 'Loading logs...' : logs }}
    </div>
  </AdminSectionShell>
</template>
