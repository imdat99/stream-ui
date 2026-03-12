<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import AppDialog from "@/components/app/AppDialog.vue";
import { useAdminRuntimeMqtt } from "@/composables/useAdminRuntimeMqtt";
import { onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

type AdminAgentRow = any;

const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);
const rows = ref<AdminAgentRow[]>([]);
const selectedRow = ref<AdminAgentRow | null>(null);
const restartOpen = ref(false);
const updateOpen = ref(false);

const loadAgents = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await rpcClient.listAdminAgents();
    rows.value = response.agents ?? [];
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin agents";
  } finally {
    loading.value = false;
  }
};

const closeDialogs = () => {
  restartOpen.value = false;
  updateOpen.value = false;
  selectedRow.value = null;
  actionError.value = null;
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
    selectedRow.value = null;
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
    selectedRow.value = null;
    await loadAgents();
  } catch (err: any) {
    actionError.value = err?.message || "Failed to update agent";
  } finally {
    submitting.value = false;
  }
};

useAdminRuntimeMqtt(({ topic, payload }) => {
  if (topic !== "picpic/events" || payload?.type !== "agent_update") return;
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
});

onMounted(loadAgents);
</script>

<template>
  <AdminSectionShell
    title="Admin Agents"
    description="Connected render workers and command controls over admin gRPC service."
  >
    <div class="mb-4 flex justify-end">
      <AppButton size="sm" variant="secondary" @click="loadAgents">Refresh agents</AppButton>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="py-3 pr-4 font-medium">Agent</th>
            <th class="py-3 pr-4 font-medium">Status</th>
            <th class="py-3 pr-4 font-medium">Platform</th>
            <th class="py-3 pr-4 font-medium">Version</th>
            <th class="py-3 pr-4 font-medium">CPU</th>
            <th class="py-3 pr-4 font-medium">RAM</th>
            <th class="py-3 pr-4 font-medium">Heartbeat</th>
            <th class="py-3 pr-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-gray-100">
            <td colspan="8" class="py-6 text-center text-gray-500">Loading agents...</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="border-b border-gray-100">
            <td colspan="8" class="py-6 text-center text-gray-500">No agents connected.</td>
          </tr>
          <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 align-top">
            <td class="py-3 pr-4 text-gray-700">
              <div class="font-medium">{{ row.name || row.id }}</div>
              <div class="text-xs text-gray-500">{{ row.id }}</div>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ row.status }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.platform || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.version || '—' }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.cpu ?? 0 }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.ram ?? 0 }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ row.lastHeartbeat ? new Date(row.lastHeartbeat).toLocaleString() : '—' }}</td>
            <td class="py-3 text-right">
              <div class="flex justify-end gap-2">
                <AppButton size="sm" variant="secondary" @click="openUpdateDialog(row)">Update</AppButton>
                <AppButton size="sm" variant="danger" @click="openRestartDialog(row)">Restart</AppButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
