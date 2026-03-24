<script setup lang="ts">
import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from "@/components/dashboard/PageHeader.vue"
import { adminPageHeaderKey, createAdminPageHeaderState } from './components/useAdminPageHeader';

const route = useRoute();
const pageHeader = createAdminPageHeaderState();

provide(adminPageHeaderKey, pageHeader);

const menuSections = [
  {
    title: 'Workspace',
    items: [
      { to: '/admin/overview', label: 'Overview', description: 'KPIs, usage and runtime pulse' },
      { to: '/admin/users', label: 'Users', description: 'Accounts, plans and moderation' },
      { to: '/admin/videos', label: 'Videos', description: 'Cross-user media inventory' },
      { to: '/admin/payments', label: 'Payments', description: 'Revenue, invoices and state changes' },
      { to: '/admin/plans', label: 'Plans', description: 'Catalog and subscription offers' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/ad-templates', label: 'Ad Templates', description: 'VAST templates and defaults' },
      { to: '/admin/player-configs', label: 'Player Configs', description: 'Cross-user player presets and defaults' },
      { to: '/admin/jobs', label: 'Jobs', description: 'Queue, retries and live logs' },
      { to: '/admin/agents', label: 'Agents', description: 'Workers, health and maintenance' },
      { to: '/admin/logs', label: 'Logs', description: 'Direct runtime log lookup' },
    ],
  },
] as const;

const matchesItem = (to: string) => route.path === to || route.path.startsWith(`${to}/`);

const activeSection = computed(() => {
  const allSections = menuSections.map((section) => section.items).flat();
  return allSections.find((section) => matchesItem(section.to)) ?? allSections[0];
});

const activeMenuGroup = computed(() => {
  return menuSections.find((section) => section.items.some((item) => matchesItem(item.to))) ?? menuSections[0];
});

const breadcrumbs = computed(() => [
  { label: 'Dashboard', to: '/overview' },
  { label: 'Admin', to: '/admin/overview' },
  ...(activeSection.value ? [{ label: activeSection.value.label }] : []),
]);

const content = computed(() => ({
  'admin-overview': {
    title: 'Overview',
    subtitle: 'KPIs, usage and runtime pulse across the admin workspace.',
  },
  'admin-users': {
    title: 'Users',
    subtitle: 'Accounts, plans and moderation tools for the full user base.',
  },
  'admin-videos': {
    title: 'Videos',
    subtitle: 'Cross-user media inventory, review and operational controls.',
  },
  'admin-payments': {
    title: 'Payments',
    subtitle: 'Revenue records, invoices and payment state operations.',
  },
  'admin-plans': {
    title: 'Plans',
    subtitle: 'Subscription catalog management and offer maintenance.',
  },
  'admin-ad-templates': {
    title: 'Ad Templates',
    subtitle: 'VAST templates, ownership metadata and default assignments.',
  },
  'admin-player-configs': {
    title: 'Player Configs',
    subtitle: 'Cross-user player presets, flags and default assignments.',
  },
  'admin-jobs': {
    title: 'Jobs',
    subtitle: 'Queue state, retries and runtime execution tracking.',
  },
  'admin-agents': {
    title: 'Agents',
    subtitle: 'Connected workers, health checks and maintenance actions.',
  },
  'admin-logs': {
    title: 'Logs',
    subtitle: 'Persisted output lookup and live runtime tailing.',
  },
}));
</script>

<template>
  <section class="space-y-5">
    <div class="space-y-3">
      <PageHeader
        :title="content[route.name as keyof typeof content]?.title || 'Workspace administration'"
        :description="content[route.name as keyof typeof content]?.subtitle || 'settings.content.fallbackSubtitle'"
        :breadcrumbs="breadcrumbs"
    />
    </div>

    <div class="mx-auto max-w-[1440px] pb-10">
      <div class="grid gap-6 xl:grid-cols-[232px_minmax(0,1fr)] xl:items-start">
        <aside class="md:w-56 shrink-0">
                <nav class="space-y-6">
                    <div v-for="section in menuSections" :key="section.title">
                        <h3 v-if="section.title" class="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 pl-3">
                            {{ section.title }}
                        </h3>
                        <ul class="space-y-0.5">
                            <li v-for="item in section.items" :key="item.to">
                                <router-link
                                    :to="item.to"
                                    :class="[
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                                        matchesItem(item.to)
                                            ? 'bg-primary/10 text-primary font-semibold'
                                                : 'text-foreground/70 hover:bg-header hover:text-foreground'
                                    ]"
                                >
                                    <component :is="item.icon" class="w-5 h-5 shrink-0" :filled="currentTab === item.value" />
                                    {{ item.label }}
                                </router-link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

        <main class="min-w-0">
          <router-view />
        </main>
      </div>
    </div>
  </section>
</template>
