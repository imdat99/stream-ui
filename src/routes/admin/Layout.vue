<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const sections = [
  { to: "/admin/overview", label: "Overview", description: "KPIs, usage and runtime pulse" },
  { to: "/admin/users", label: "Users", description: "Accounts, plans and moderation" },
  { to: "/admin/videos", label: "Videos", description: "Cross-user media inventory" },
  { to: "/admin/payments", label: "Payments", description: "Revenue, invoices and state changes" },
  { to: "/admin/plans", label: "Plans", description: "Catalog and subscription offers" },
  { to: "/admin/ad-templates", label: "Ad Templates", description: "VAST templates and defaults" },
  { to: "/admin/jobs", label: "Jobs", description: "Queue, retries and live logs" },
  { to: "/admin/agents", label: "Agents", description: "Workers, health and maintenance" },
  { to: "/admin/logs", label: "Logs", description: "Direct runtime log lookup" },
] as const;

const activeSection = computed(() => {
  return sections.find((section) => route.path === section.to || route.path.startsWith(`${section.to}/`)) ?? sections[0];
});
</script>

<template>
  <section class="space-y-5">
    <div class="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_38%),linear-gradient(135deg,#020617,#0f172a_52%,#111827)] px-6 py-6 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)]">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl space-y-3">
          <div class="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
            Admin Console
          </div>
          <div>
            <h1 class="text-3xl font-semibold tracking-tight text-white md:text-4xl">Operate the entire Stream workspace from one surface.</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Screen coverage is aligned around the current Tiny-RPC + gRPC admin contract. Use the navigation below to jump between CRUD workflows, runtime operations and diagnostics.
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Current module</div>
            <div class="mt-2 text-lg font-semibold text-white">{{ activeSection.label }}</div>
            <div class="mt-1 text-sm text-slate-300">{{ activeSection.description }}</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Coverage</div>
            <div class="mt-2 text-lg font-semibold text-white">{{ sections.length }} screens</div>
            <div class="mt-1 text-sm text-slate-300">Overview, CRUD, runtime and logs.</div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <div class="text-[11px] uppercase tracking-[0.22em] text-slate-400">Data path</div>
            <div class="mt-2 text-lg font-semibold text-white">Tiny-RPC</div>
            <div class="mt-1 text-sm text-slate-300">Canonical gRPC-backed admin transport.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside class="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
        <nav class="space-y-1">
          <router-link
            v-for="section in sections"
            :key="section.to"
            :to="section.to"
            class="group flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
            :class="route.path === section.to || route.path.startsWith(`${section.to}/`) ? 'bg-slate-950 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.8)]' : 'text-slate-700 hover:bg-slate-50'"
          >
            <div class="mt-0.5 h-2.5 w-2.5 rounded-full" :class="route.path === section.to || route.path.startsWith(`${section.to}/`) ? 'bg-sky-400' : 'bg-slate-300 group-hover:bg-slate-500'" />
            <div class="min-w-0">
              <div class="text-sm font-semibold tracking-tight">{{ section.label }}</div>
              <div class="mt-1 text-xs leading-5" :class="route.path === section.to || route.path.startsWith(`${section.to}/`) ? 'text-slate-300' : 'text-slate-500'">
                {{ section.description }}
              </div>
            </div>
          </router-link>
        </nav>
      </aside>

      <div class="min-w-0">
        <router-view />
      </div>
    </div>
  </section>
</template>
