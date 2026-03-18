<template>
    <section>
    <PageHeader
        :title="content[route.name as keyof typeof content]?.title || t('settings.content.fallbackTitle')"
        :description="content[route.name as keyof typeof content]?.subtitle || t('settings.content.fallbackSubtitle')"
        :breadcrumbs="breadcrumbs"
    />
    <div class="max-w-7xl mx-auto pb-12">

        <div class="flex flex-col md:flex-row gap-8 mt-6">
            <!-- Sidebar Navigation (GitHub-style) -->
            <aside class="md:w-56 shrink-0">
                <div class="flex items-center gap-4 mb-8">
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserIcon class="w-8 h-8 text-primary" :filled="true" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">{{ auth.user?.username || t('app.name') }}</h3>
                        <p class="text-sm text-foreground/60">{{ auth.user?.email || '' }}</p>
                    </div>
                </div>
                <nav class="space-y-6">
                    <div v-for="section in menuSections" :key="section.title">
                        <h3 v-if="section.title" class="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 pl-3">
                            {{ section.title }}
                        </h3>
                        <ul class="space-y-0.5">
                            <li v-for="item in section.items" :key="item.value">
                                <router-link
                                    :to="tabPaths[item.value]"
                                    :class="[
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150',
                                        currentTab === item.value
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : item.danger
                                                ? 'text-danger hover:bg-danger/10'
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
import AppConfirmHost from '@/components/ui/AppConfirmHost.vue';
import AppToastHost from '@/components/ui/AppToastHost.vue';
import ClientOnly from '@/components/ClientOnly';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import AdvertisementIcon from '@/components/icons/AdvertisementIcon.vue';
import AlertTriangle from '@/components/icons/AlertTriangle.vue';
import Bell from '@/components/icons/Bell.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import GlobeIcon from '@/components/icons/Globe.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import VideoPlayIcon from '@/components/icons/VideoPlayIcon.vue';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from 'i18next-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const auth = useAuthStore();
const { t } = useTranslation();
// Map tab values to their paths
const tabPaths: Record<string, string> = {
    profile: '/settings',
    security: '/settings/security',
    notifications: '/settings/notifications',
    player: '/settings/player',
    billing: '/settings/billing',
    domains: '/settings/domains',
    ads: '/settings/ads',
    danger: '/settings/danger',
};

// Menu items grouped by category (GitHub-style)
const menuSections = computed<{ title: string; items: { value: string; label: string; icon: any, danger?: boolean }[] }[]>(() => [
    {
        title: t('settings.menu.securityGroup'),
        items: [
            { value: 'security', label: t('settings.menu.security'), icon: UserIcon },
            { value: 'billing', label: t('settings.menu.billing'), icon: CreditCardIcon },
        ],
    },
    {
        title: t('settings.menu.preferencesGroup'),
        items: [
            { value: 'notifications', label: t('settings.menu.notifications'), icon: Bell },
            { value: 'player', label: t('settings.menu.player'), icon: VideoPlayIcon },
        ],
    },
    {
        title: t('settings.menu.integrationsGroup'),
        items: [
            { value: 'domains', label: t('settings.menu.domains'), icon: GlobeIcon },
            { value: 'ads', label: t('settings.menu.ads'), icon: AdvertisementIcon },
        ],
    },
    {
        title: t('settings.menu.dangerGroup'),
        items: [
            { value: 'danger', label: t('settings.menu.danger'), icon: AlertTriangle, danger: true },
        ],
    },
] as const);

type TabValue = 'profile' | 'security' | 'notifications' | 'player' | 'billing' | 'domains' | 'ads' | 'danger';

// Get current tab from route path
const currentTab = computed<TabValue>(() => {
    const path = route.path as string;
    const tabName = path.replace('/settings', '') || '/profile';
    if (tabName === '' || tabName === '/') return 'profile';
    return (tabName.replace('/', '') as TabValue) || 'profile';
});

// Breadcrumbs with dynamic tab
const allMenuItems = computed(() => menuSections.value.flatMap(section => section.items));
const currentItem = computed(() => allMenuItems.value.find(item => item.value === currentTab.value));

const breadcrumbs = computed(() => [
    { label: t('pageHeader.dashboard'), to: '/overview' },
    { label: t('pageHeader.settings'), to: '/settings' },
    ...(currentItem.value ? [{ label: currentItem.value.label }] : []),
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
    'settings-player': {
        title: t('settings.content.player.title'),
        subtitle: t('settings.content.player.subtitle')
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
    'settings-danger': {
        title: t('settings.content.danger.title'),
        subtitle: t('settings.content.danger.subtitle')
    }
}));
</script>
