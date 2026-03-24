<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import { useQuery } from "@pinia/colada";
import { computed, onMounted, ref } from "vue";
import StatsOverview from "./StatsOverview.vue";


const error = ref<string | null>(null);
// const dashboard = ref<AdminDashboard | null>(null);

const cards = computed(() => {
  const data = dashboard.value;
  return [
    { title: "Total users", value: data?.totalUsers ?? 0, note: `${data?.newUsersToday ?? 0} new today`, tone: 'accent' as const },
    { title: "Total videos", value: data?.totalVideos ?? 0, note: `${data?.newVideosToday ?? 0} new today`, tone: 'success' as const },
    { title: "Payments", value: data?.totalPayments ?? 0, note: "Completed finance events", tone: 'warning' as const },
    { title: "Revenue", value: data?.totalRevenue ?? 0, note: "Lifetime gross amount", tone: 'neutral' as const },
  ];
});

const secondaryCards = computed(() => {
  const data = dashboard.value;
  return [
    { title: "Active subscriptions", value: data?.activeSubscriptions ?? 0 },
    { title: "Ad templates", value: data?.totalAdTemplates ?? 0 },
    { title: "New users today", value: data?.newUsersToday ?? 0 },
    { title: "New videos today", value: data?.newVideosToday ?? 0 },
  ];
});

const highlights = computed(() => {
  const data = dashboard.value;
  return [
    { label: "Acquisition", value: `${data?.newUsersToday ?? 0} user signups in the current day window.` },
    { label: "Content velocity", value: `${data?.newVideosToday ?? 0} newly created videos landed today.` },
    { label: "Catalog depth", value: `${data?.totalAdTemplates ?? 0} ad templates available to pair with uploads.` },
  ];
});

const { data: dashboard, isLoading, refresh } = useQuery({
  key: () => ['admin-dashboard'],
  query: () => rpcClient.getAdminDashboard(),
});
onMounted(refresh);
</script>

<template>
  <StatsOverview :loading="isLoading" :stats="cards" />
  <div class="mb-8">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="card in secondaryCards" :key="card.title"
          class="rounded-lg border border-border bg-muted/15 px-4 py-4">
          <div class="text-[11px] font-medium text-foreground/55">{{ card.title }}</div>
          <div class="mt-3 text-2xl font-semibold tracking-tight text-foreground">{{ isLoading ? '—' : card.value }}
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-border bg-muted/15 p-4">
        <div class="text-[11px] font-medium text-foreground/55">Operations notes</div>
        <div class="mt-4 space-y-3">
          <div v-for="item in highlights" :key="item.label"
            class="rounded-2xl border border-border bg-background px-4 py-3">
            <div class="text-[11px] font-medium text-foreground/55">{{ item.label }}</div>
            <div class="mt-1 text-sm leading-6 text-foreground/70">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
