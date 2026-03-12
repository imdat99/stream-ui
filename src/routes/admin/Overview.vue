<script setup lang="ts">
import { client as rpcClient } from "@/api/rpcclient";
import AppButton from "@/components/app/AppButton.vue";
import { computed, onMounted, ref } from "vue";
import AdminSectionShell from "./components/AdminSectionShell.vue";

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

onMounted(loadDashboard);
</script>

<template>
  <AdminSectionShell
    title="Admin Overview"
    description="High-signal workspace metrics surfaced from the admin gRPC dashboard contract."
    eyebrow="Control room"
    badge="Realtime-ready summary"
  >
    <template #toolbar>
      <AppButton size="sm" variant="secondary" :loading="loading" @click="loadDashboard">
        Refresh metrics
      </AppButton>
    </template>

    <template #aside>
      <div class="space-y-5">
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Operations notes</div>
          <div class="mt-3 space-y-3">
            <div v-for="item in highlights" :key="item.label" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</div>
              <div class="mt-1 text-sm leading-6 text-slate-200">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-else class="space-y-5">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in cards" :key="card.title" class="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_12px_40px_-34px_rgba(15,23,42,0.45)]">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{{ card.title }}</div>
          <div class="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{{ loading ? '—' : card.value }}</div>
          <div class="mt-2 text-sm text-slate-500">{{ card.note }}</div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div class="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">System snapshot</div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div v-for="card in secondaryCards" :key="card.title" class="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <div class="text-sm text-slate-500">{{ card.title }}</div>
              <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{{ loading ? '—' : card.value }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-[24px] border border-slate-200 bg-white p-5">
          <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard source</div>
          <div class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>This overview intentionally stays on top of the existing admin dashboard RPC instead of composing a new transport layer.</p>
            <p>Use module pages for operational actions, while this screen remains a concise summary surface for operators landing in the console.</p>
          </div>
        </div>
      </div>
    </div>
  </AdminSectionShell>
</template>
