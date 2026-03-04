<template>
    <section>
    <PageHeader
        :title="content[route.name as keyof typeof content]?.title || 'Settings'"
        :description="content[route.name as keyof typeof content]?.subtitle || 'Manage your account settings and preferences.'"
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
                        <h3 class="text-lg font-semibold text-foreground">{{ auth.user?.username || 'User' }}</h3>
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
                                                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import AppConfirmHost from '@/components/app/AppConfirmHost.vue';
import AppToastHost from '@/components/app/AppToastHost.vue';
import ClientOnly from '@/components/ClientOnly';
import UserIcon from '@/components/icons/UserIcon.vue';
import GlobeIcon from '@/components/icons/Globe.vue';
import AlertTriangle from '@/components/icons/AlertTriangle.vue';
import { useAuthStore } from '@/stores/auth';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import Bell from '@/components/icons/Bell.vue';
import AdvertisementIcon from '@/components/icons/AdvertisementIcon.vue';
import VideoPlayIcon from '@/components/icons/VideoPlayIcon.vue';

const route = useRoute();
const auth = useAuthStore();
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
const menuSections: { title?: string; items: { value: string; label: string; icon: any; danger?: boolean }[] }[] = [
    {
        title: 'Security',
        items: [
            { value: 'security', label: 'Security', icon: UserIcon },
            { value: 'billing', label: 'Billing & Plans', icon: CreditCardIcon },
        ],
    },
    {
        title: 'Preferences',
        items: [
            { value: 'notifications', label: 'Notifications', icon: Bell },
            { value: 'player', label: 'Player', icon: VideoPlayIcon },
        ],
    },
    {
        title: 'Integrations',
        items: [
            { value: 'domains', label: 'Allowed Domains', icon: GlobeIcon },
            { value: 'ads', label: 'Ads & VAST', icon: AdvertisementIcon },
        ],
    },
    {
        title: 'Danger Zone',
        items: [
            { value: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
        ],
    },
] as const;

type TabValue = typeof menuSections[number]['items'][number]['value'];

// Get current tab from route path
const currentTab = computed<TabValue>(() => {
    const path = route.path as string;
    const tabName = path.replace('/settings', '') || '/profile';
    if (tabName === '' || tabName === '/') return 'profile';
    return (tabName.replace('/', '') as TabValue) || 'profile';
});

// Breadcrumbs with dynamic tab
const allMenuItems = menuSections.flatMap(section => section.items);
const currentItem = allMenuItems.find(item => item.value === currentTab.value);

const breadcrumbs = [
    { label: 'Dashboard', to: '/overview' },
    { label: 'Settings', to: '/settings' },
    ...(currentItem ? [{ label: currentItem.label }] : []),
];

const content = {
    security: {
        title: 'Security & Connected Apps',
        subtitle: 'Manage your security settings and connected applications.'
    },
    notifications: {
        title: 'Notifications',
        subtitle: 'Choose how you want to receive notifications and updates.'
    },
    player: {
        title: 'Player Settings',
        subtitle: 'Configure default video player behavior and features.'
    },
    billing: {
        title: 'Billing & Plans',
        subtitle: 'Your current subscription and billing information.'
    },
    domains: {
        title: 'Allowed Domains',
        subtitle: 'Add domains to your whitelist to allow embedding content via iframe.'
    },
    ads: {
        title: 'Ads & VAST',
        subtitle: 'Create and manage VAST ad templates for your videos.'
    },
    danger: {
        title: 'Danger Zone',
        subtitle: 'Irreversible and destructive actions. Be careful!'
    }
}
</script>
