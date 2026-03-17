<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import SettingsSectionCard from "@/routes/settings/components/SettingsSectionCard.vue";
import { computed, onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";
import { useAdminPageHeader } from "./components/useAdminPageHeader";

type AdminDashboard = Awaited<ReturnType<typeof rpcClient.getAdminDashboard>>;

const loading = ref(true);
const error = ref<string | null>(null);
const dashboard = ref<AdminDashboard | null>(null);

const cards = computed(() => {
  const data = dashboard.value;
  return [
    { title: "Total users", value: data?.totalUsers ?? 0, note: `${data?.newUsersToday ?? 0} new today` },
    { title: "Total videos", value: data?.totalVideos ?? 0, note: `${data?.newVideosToday ?? 0} new today` },
    { title: "Payments", value: data?.totalPayments ?? 0, note: "Completed finance events" },
    { title: "Revenue", value: data?.totalRevenue ?? 0, note: "Lifetime gross amount" },
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

const loadDashboard = async () => {
  loading.value = true;
  error.value = null;
  try {
    dashboard.value = await rpcClient.getAdminDashboard();
  } catch (err: any) {
    error.value = err?.message || "Failed to load admin dashboard";
  } finally {
    loading.value = false;
  }
};

useAdminPageHeader(() => ({
  eyebrow: "Control room",
  badge: "Realtime-ready summary",
  actions: [{
    label: "Refresh metrics",
    variant: "secondary",
    onClick: loadDashboard,
  }],
}));

onMounted(loadDashboard);
</script>

<template>
  <AdminSectionShell>

    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in cards" :key="card.title" class="rounded-lg border border-border bg-muted/20 p-5">
          <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">{{ card.title }}</div>
          <div class="mt-3 text-3xl font-semibold tracking-tight text-foreground">{{ loading ? '—' : card.value }}</div>
          <div class="mt-2 text-sm text-foreground/60">{{ card.note }}</div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SettingsSectionCard title="System snapshot" description="Core counters from the admin dashboard surface." bodyClass="p-5">
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="card in secondaryCards" :key="card.title" class="rounded-lg border border-border bg-muted/20 px-4 py-4">
              <div class="text-sm text-foreground/60">{{ card.title }}</div>
              <div class="mt-2 text-2xl font-semibold tracking-tight text-foreground">{{ loading ? '—' : card.value }}</div>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Operations notes" description="Quick context for operators landing in the console." bodyClass="p-5">
          <div class="space-y-3">
            <div v-for="item in highlights" :key="item.label" class="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.16em] text-foreground/50">{{ item.label }}</div>
              <div class="mt-1 text-sm leading-6 text-foreground/70">{{ item.value }}</div>
            </div>
          </div>
        </SettingsSectionCard>
      </div>

      <SettingsSectionCard title="Dashboard source" description="Why this page stays intentionally lightweight." bodyClass="p-5">
        <div class="space-y-3 text-sm leading-6 text-foreground/70">
          <p>This overview intentionally stays on top of the existing admin dashboard RPC instead of composing a new transport layer.</p>
          <p>Use module pages for operational actions, while this screen remains a concise summary surface for operators landing in the console.</p>
        </div>
      </SettingsSectionCard>
    </div>
  </AdminSectionShell>
</template>
