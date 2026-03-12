<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import StatsCard from "@/components/dashboard/StatsCard.vue";
import { computed, onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

const loading = ref(true);
const error = ref<string | null>(null);
const dashboard = ref<any | null>(null);

const cards = computed(() => {
  const data = dashboard.value;
  return [
    { title: "Total users", value: data?.totalUsers ?? 0, color: "primary" as const },
    { title: "Total videos", value: data?.totalVideos ?? 0, color: "info" as const },
    { title: "Payments", value: data?.totalPayments ?? 0, color: "success" as const },
    { title: "Revenue", value: data?.totalRevenue ?? 0, color: "warning" as const },
    { title: "Active subscriptions", value: data?.activeSubscriptions ?? 0, color: "primary" as const },
    { title: "Ad templates", value: data?.totalAdTemplates ?? 0, color: "info" as const },
    { title: "New users today", value: data?.newUsersToday ?? 0, color: "success" as const },
    { title: "New videos today", value: data?.newVideosToday ?? 0, color: "warning" as const },
  ];
});

onMounted(async () => {
  try {
    dashboard.value = await rpcClient.getAdminDashboard();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin dashboard";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <AdminSectionShell
    title="Admin Overview"
    description="System-wide metrics from backend gRPC admin service."
  >
    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        v-for="card in cards"
        :key="card.title"
        :title="card.title"
        :value="loading ? 0 : card.value"
        :color="card.color"
      />
    </div>
  </AdminSectionShell>
</template>
