<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import NotificationActions from './components/NotificationActions.vue';
import NotificationList from './components/NotificationList.vue';
import NotificationTabs from './components/NotificationTabs.vue';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'video' | 'payment' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

const loading = ref(false);
const activeTab = ref('all');
const { t } = useI18n();

const notifications = ref<Notification[]>([
    {
        id: '1',
        type: 'video',
        title: t('notification.mocks.videoProcessed.title'),
        message: t('notification.mocks.videoProcessed.message'),
        time: t('notification.time.minutesAgo', { count: 2 }),
        read: false,
        actionUrl: '/video',
        actionLabel: t('notification.actions.viewVideo')
    },
    {
        id: '2',
        type: 'payment',
        title: t('notification.mocks.paymentSuccess.title'),
        message: t('notification.mocks.paymentSuccess.message'),
        time: t('notification.time.hoursAgo', { count: 1 }),
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: t('notification.actions.viewReceipt')
    },
    {
        id: '3',
        type: 'warning',
        title: t('notification.mocks.storageWarning.title'),
        message: t('notification.mocks.storageWarning.message'),
        time: t('notification.time.hoursAgo', { count: 3 }),
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: t('notification.actions.upgradePlan')
    },
    {
        id: '4',
        type: 'success',
        title: t('notification.mocks.uploadSuccess.title'),
        message: t('notification.mocks.uploadSuccess.message'),
        time: t('notification.time.daysAgo', { count: 1 }),
        read: true
    },
    {
        id: '5',
        type: 'system',
        title: t('notification.mocks.maintenance.title'),
        message: t('notification.mocks.maintenance.message'),
        time: t('notification.time.daysAgo', { count: 2 }),
        read: true
    },
    {
        id: '6',
        type: 'info',
        title: t('notification.mocks.newFeature.title'),
        message: t('notification.mocks.newFeature.message'),
        time: t('notification.time.daysAgo', { count: 3 }),
        read: true,
        actionUrl: '/video',
        actionLabel: t('notification.actions.tryNow')
    }
]);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

const tabs = computed(() => [
    { key: 'all', label: t('notification.tabs.all'), icon: 'i-lucide-inbox', count: notifications.value.length },
    { key: 'unread', label: t('notification.tabs.unread'), icon: 'i-lucide-bell-dot', count: unreadCount.value },
    { key: 'video', label: t('notification.tabs.videos'), icon: 'i-lucide-video', count: notifications.value.filter(n => n.type === 'video').length },
    { key: 'payment', label: t('notification.tabs.payments'), icon: 'i-lucide-credit-card', count: notifications.value.filter(n => n.type === 'payment').length }
]);

const filteredNotifications = computed(() => {
    if (activeTab.value === 'all') return notifications.value;
    if (activeTab.value === 'unread') return notifications.value.filter(n => !n.read);
    return notifications.value.filter(n => n.type === activeTab.value);
});

const handleMarkRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id);
    if (notification) notification.read = true;
};

const handleDelete = (id: string) => {
    notifications.value = notifications.value.filter(n => n.id !== id);
};

const handleMarkAllRead = () => {
    notifications.value.forEach(n => n.read = true);
};

const handleClearAll = () => {
    notifications.value = [];
};
</script>

<template>
    <div>
        <PageHeader
            :title="t('notification.title')"
            :description="t('notification.subtitle')"
            :breadcrumbs="[
                { label: t('pageHeader.dashboard'), to: '/' },
                { label: t('nav.notification') }
            ]"
        />
        <div class="w-full max-w-4xl mx-auto mt-6">
            <div class="notification-container bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <NotificationActions
                    :loading="loading"
                    :total-count="notifications.length"
                    :unread-count="unreadCount"
                    @mark-all-read="handleMarkAllRead"
                    @clear-all="handleClearAll"
                />

                <NotificationTabs
                    :tabs="tabs"
                    :active-tab="activeTab"
                    @update:active-tab="activeTab = $event"
                />

                <NotificationList
                    :notifications="filteredNotifications"
                    :loading="loading"
                    @mark-read="handleMarkRead"
                    @delete="handleDelete"
                />
            </div>
        </div>
    </div>
</template>
