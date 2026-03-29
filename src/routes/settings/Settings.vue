<template>
    <section>
        <PageHeader :title="content[route.name as keyof typeof content]?.title || t('settings.content.fallbackTitle')"
            :description="content[route.name as keyof typeof content]?.subtitle || t('settings.content.fallbackSubtitle')"
            :breadcrumbs="breadcrumbs" />
        <div class="max-w-7xl mx-auto pb-12">

            <div class="flex flex-col md:flex-row gap-8 mt-6">
                <!-- Sidebar Navigation (GitHub-style) -->
                <aside class="md:w-56 shrink-0">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <UserIcon class="w-8 h-8 text-primary" :filled="true" />
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-foreground">{{ auth.user?.username || t('app.name') }}
                            </h3>
                            <p class="text-sm text-foreground/60">{{ auth.user?.email || '' }}</p>
                        </div>
                    </div>
                    <nav class="space-y-6">
                        <div v-for="section in menuSections" :key="section.title">
                            <h3 v-if="section.title"
                                class="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 pl-3">
                                {{ section.title }}
                            </h3>
                            <ul class="space-y-0.5">
                                <li v-for="item in section.items" :key="item.value">
                                    <router-link :to="item.to" :class="[
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                                        currentTab === item.value
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : item.danger
                                                ? 'text-danger hover:bg-danger/10'
                                                : 'text-foreground/70 hover:bg-header hover:text-foreground'
                                    ]">
                                        <component :is="item.icon" class="w-5 h-5 shrink-0"
                                            :filled="currentTab === item.value" />
                                        {{ item.label }}
                                    </router-link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </aside>

                <!-- Main Content Area -->
                <main class="flex-1 min-w-0">
                    <router-view />

                    <!-- Settings-only toast/confirm hosts (no PrimeVue dependency) -->
                    <ClientOnly>
                        <AppToastHost />
                        <AppConfirmHost />
                    </ClientOnly>
                </main>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import ClientOnly from '@/components/ClientOnly';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import AdvertisementIcon from '@/components/icons/AdvertisementIcon.vue';
import AlertTriangle from '@/components/icons/AlertTriangle.vue';
import Bell from '@/components/icons/Bell.vue';
import Credit from '@/components/icons/Credit.vue';
import GlobeIcon from '@/components/icons/Globe.vue';
import ShieldUser from '@/components/icons/shield-user.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import VideoPlayIcon from '@/components/icons/VideoPlayIcon.vue';
import Windows from '@/components/icons/windows.vue';
import AppConfirmHost from '@/components/ui/AppConfirmHost.vue';
import AppToastHost from '@/components/ui/AppToastHost.vue';
import { isAdmin } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const auth = useAuthStore();
const { t } = useTranslation();

type MenuItem = {
    to: string
    value: string
    label: string
    icon?: any
    description?: string
    danger?: boolean
}
// Menu items grouped by category (GitHub-style)
const menuSections = computed<{ title: string; items: MenuItem[] }[]>(() => [
    {
        title: t('settings.menu.securityGroup'),
        items: [
            {
                to: '/settings/security',
                value: 'security', label: t('settings.menu.security'), icon: ShieldUser
            },
            { to: '/settings/billing', value: 'billing', label: t('settings.menu.billing'), icon: Credit },
        ],
    },
    {
        title: t('settings.menu.preferencesGroup'),
        items: [
            { to: '/settings/notifications', value: 'notifications', label: t('settings.menu.notifications'), icon: Bell },
        ],
    },
    {
        title: t('settings.menu.playerGroup'),
        items: [
            { to: '/settings/player-configs', value: 'player-configs', label: t('settings.menu.playerConfigs'), icon: VideoPlayIcon },
        ],
    },
    {
        title: t('settings.menu.integrationsGroup'),
        items: [
            { to: '/settings/domains', value: 'domains', label: t('settings.menu.domains'), icon: GlobeIcon },
            { to: '/settings/ads', value: 'ads', label: t('settings.menu.ads'), icon: AdvertisementIcon },
            { to: '/settings/popup-ads', value: 'popup-ads', label: t('settings.menu.popupAds'), icon: Windows },
        ],
    },
    ...(isAdmin(auth.user?.role) ? [{
        title: 'Admin Workspace',
        items: [
            { to: '/settings/admin/users', value: 'admin-users', label: 'Users', description: 'Accounts, plans and moderation' },
            { to: '/settings/admin/videos', value: 'admin-videos', label: 'Videos', description: 'Cross-user media inventory' },
            { to: '/settings/admin/payments', value: 'admin-payments', label: 'Payments', description: 'Revenue, invoices and state changes' },
            { to: '/settings/admin/plans', value: 'admin-plans', label: 'Plans', description: 'Catalog and subscription offers' },
        ],
    },
    {
        title: 'Admin Operations',
        items: [
            { to: '/settings/admin/ad-templates', value: 'admin-ad-templates', label: 'Ad Templates', description: 'VAST templates and defaults' },
            { to: '/settings/admin/popup-ads', value: 'admin-popup-ads', label: 'Popup Ads', description: 'Popup campaigns, timing and cooldowns' },
            { to: '/settings/admin/player-configs', value: 'admin-player-configs', label: 'Player Configs', description: 'Cross-user player presets and defaults' },
            { to: '/settings/admin/jobs', value: 'admin-jobs', label: 'Jobs', description: 'Queue, retries and live logs' },
            { to: '/settings/admin/agents', value: 'admin-agents', label: 'Agents', description: 'Workers, health and maintenance' },
            { to: '/settings/admin/logs', value: 'admin-logs', label: 'Logs', description: 'Direct runtime log lookup' },
        ],
    },] : []),
    {
        title: t('settings.menu.dangerGroup'),
        items: [
            { to: '/settings/danger', value: 'danger', label: t('settings.menu.danger'), icon: AlertTriangle, danger: true },
        ],
    }
] as const);

type TabValue = 'profile' | 'security' | 'notifications' | 'playerConfigs' | 'billing' | 'domains' | 'ads' | 'danger';

// Get current tab from route path
const currentTab = computed<TabValue>(() => {
    const path = route.path as string;
    const tabName = path.replace('/settings', '') || '/profile';
    // support admin sub-routes
    if (tabName.startsWith('/admin/')) {
        return tabName.replace('/admin/', 'admin-') as TabValue;
    }
    if (tabName === '' || tabName === '/') return 'profile';
    return (tabName.replace('/', '') as TabValue) || 'profile';
});

// Breadcrumbs with dynamic tab
const allMenuItems = computed(() => menuSections.value.map(section => section.items).flat());
const currentItem = computed(() => allMenuItems.value.find(item => item.value === currentTab.value));

const breadcrumbs = computed(() => [
    { label: t('pageHeader.dashboard'), to: '/overview' },
    { label: t('pageHeader.settings'), to: '/settings' },
    ...(currentItem.value ? [{ label: currentItem.value.label + (currentItem.value.value.includes("admin") ? " (Admin)" : "") }] : []),
]);

const content = computed(() => ({
    'settings-security': {
        title: t('settings.content.security.title'),
        subtitle: t('settings.content.security.subtitle')
    },
    'settings-notifications': {
        title: t('settings.content.notifications.title'),
        subtitle: t('settings.content.notifications.subtitle')
    },
    'settings-billing': {
        title: t('settings.content.billing.title'),
        subtitle: t('settings.content.billing.subtitle')
    },
    'settings-domains': {
        title: t('settings.content.domains.title'),
        subtitle: t('settings.content.domains.subtitle')
    },
    'settings-ads': {
        title: t('settings.content.ads.title'),
        subtitle: t('settings.content.ads.subtitle')
    },
    'settings-popup-ads': {
        title: t('settings.content.popupAds.title'),
        subtitle: t('settings.content.popupAds.subtitle')
     },
    'settings-player-configs': {
        title: t('settings.content.playerConfigs.title'),
        subtitle: t('settings.content.playerConfigs.subtitle')
    },
    'settings-danger': {
        title: t('settings.content.danger.title'),
        subtitle: t('settings.content.danger.subtitle')
    },
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
    'admin-popup-ads': {
        title: 'Popup Ads',
        subtitle: 'Popup campaigns, timing windows and cooldown controls across users.',
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
