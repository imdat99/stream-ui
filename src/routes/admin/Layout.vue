<script setup lang="ts">
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { computed, provide } from "vue";
import { useRoute } from "vue-router";
import { adminPageHeaderKey, createAdminPageHeaderState } from "./components/useAdminPageHeader";

const route = useRoute();
const pageHeader = createAdminPageHeaderState();

provide(adminPageHeaderKey, pageHeader);

const menuSections = [
  {
    title: "Workspace",
    items: [
      { to: "/admin/overview", label: "Overview", description: "KPIs, usage and runtime pulse" },
      { to: "/admin/users", label: "Users", description: "Accounts, plans and moderation" },
      { to: "/admin/videos", label: "Videos", description: "Cross-user media inventory" },
      { to: "/admin/payments", label: "Payments", description: "Revenue, invoices and state changes" },
      { to: "/admin/plans", label: "Plans", description: "Catalog and subscription offers" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/admin/ad-templates", label: "Ad Templates", description: "VAST templates and defaults" },
      { to: "/admin/jobs", label: "Jobs", description: "Queue, retries and live logs" },
      { to: "/admin/agents", label: "Agents", description: "Workers, health and maintenance" },
      { to: "/admin/logs", label: "Logs", description: "Direct runtime log lookup" },
    ],
  },
] as const;

const allSections = computed(() => menuSections.flatMap((section) => section.items));
const activeSection = computed(() => {
  return allSections.value.find((section) => route.path === section.to || route.path.startsWith(`${section.to}/`)) ?? allSections.value[0];
});

const breadcrumbs = computed(() => [
  { label: "Dashboard", to: "/overview" },
  { label: "Admin", to: "/admin/overview" },
  ...(activeSection.value ? [{ label: activeSection.value.label }] : []),
]);

const content = computed(() => ({
  "admin-overview": {
    title: "Overview",
    subtitle: "KPIs, usage and runtime pulse across the admin workspace.",
  },
  "admin-users": {
    title: "Users",
    subtitle: "Accounts, plans and moderation tools for the full user base.",
  },
  "admin-videos": {
    title: "Videos",
    subtitle: "Cross-user media inventory, review and operational controls.",
  },
  "admin-payments": {
    title: "Payments",
    subtitle: "Revenue records, invoices and payment state operations.",
  },
  "admin-plans": {
    title: "Plans",
    subtitle: "Subscription catalog management and offer maintenance.",
  },
  "admin-ad-templates": {
    title: "Ad Templates",
    subtitle: "VAST templates, ownership metadata and default assignments.",
  },
  "admin-jobs": {
    title: "Jobs",
    subtitle: "Queue state, retries and runtime execution tracking.",
  },
  "admin-agents": {
    title: "Agents",
    subtitle: "Connected workers, health checks and maintenance actions.",
  },
  "admin-logs": {
    title: "Logs",
    subtitle: "Persisted output lookup and live runtime tailing.",
  },
}));
</script>

<template>
  <section>
    <div class="space-y-3">
      <div v-if="pageHeader.eyebrow || pageHeader.badge" class="flex flex-wrap items-center gap-2">
        <span v-if="pageHeader.eyebrow" class="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {{ pageHeader.eyebrow }}
        </span>
        <span v-if="pageHeader.badge" class="inline-flex items-center rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-foreground/60">
          {{ pageHeader.badge }}
        </span>
      </div>

      <PageHeader
        :title="content[route.name as keyof typeof content]?.title || 'Workspace administration'"
        :description="content[route.name as keyof typeof content]?.subtitle || 'Quản lý dữ liệu, vận hành và chẩn đoán hệ thống theo cùng bố cục với khu settings.'"
        :breadcrumbs="breadcrumbs"
        :actions="pageHeader.actions"
      />
    </div>

    <div class="max-w-7xl mx-auto pb-12">
      <div class="mt-6 flex flex-col gap-8 md:flex-row">
        <aside class="md:w-56 shrink-0">
          <div class="mb-8 rounded-lg border border-border bg-header px-4 py-4">
            <div class="text-sm font-semibold text-foreground">{{ activeSection?.label }}</div>
            <p class="mt-1 text-sm text-foreground/60">{{ activeSection?.description }}</p>
          </div>

          <nav class="space-y-6">
            <div v-for="section in menuSections" :key="section.title">
              <h3 class="mb-2 pl-3 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                {{ section.title }}
              </h3>
              <ul class="space-y-0.5">
                <li v-for="item in section.items" :key="item.to">
                  <router-link
                    :to="item.to"
                    :class="[
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                      route.path === item.to || route.path.startsWith(`${item.to}/`)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground/70 hover:bg-header hover:text-foreground'
                    ]"
                  >
                    {{ item.label }}
                  </router-link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main class="flex-1 min-w-0">
          <router-view />
        </main>
      </div>
    </div>
  </section>
</template>
