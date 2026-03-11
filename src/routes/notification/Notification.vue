<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTranslation } from 'i18next-vue';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import NotificationActions from './components/NotificationActions.vue';
import NotificationList from './components/NotificationList.vue';
import NotificationTabs from './components/NotificationTabs.vue';
import { useNotifications } from '@/composables/useNotifications';

const activeTab = ref('all');
const { t } = useTranslation();
const notificationStore = useNotifications();

onMounted(() => {
    void notificationStore.fetchNotifications();
});

const unreadCount = computed(() => notificationStore.unreadCount.value);

const tabs = computed(() => [
    { key: 'all', label: t('notification.tabs.all'), icon: 'i-lucide-inbox', count: notificationStore.notifications.value.length },
    { key: 'unread', label: t('notification.tabs.unread'), icon: 'i-lucide-bell-dot', count: unreadCount.value },
    { key: 'video', label: t('notification.tabs.videos'), icon: 'i-lucide-video', count: notificationStore.notifications.value.filter(n => n.type === 'video').length },
    { key: 'payment', label: t('notification.tabs.payments'), icon: 'i-lucide-credit-card', count: notificationStore.notifications.value.filter(n => n.type === 'payment').length },
]);

const filteredNotifications = computed(() => {
    if (activeTab.value === 'all') return notificationStore.notifications.value;
    if (activeTab.value === 'unread') return notificationStore.notifications.value.filter(n => !n.read);
    return notificationStore.notifications.value.filter(n => n.type === activeTab.value);
});

const handleMarkRead = async (id: string) => {
    await notificationStore.markRead(id);
};

const handleDelete = async (id: string) => {
    await notificationStore.deleteNotification(id);
};

const handleMarkAllRead = async () => {
    await notificationStore.markAllRead();
};

const handleClearAll = async () => {
    await notificationStore.clearAll();
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
                    :loading="notificationStore.loading.value"
                    :total-count="notificationStore.notifications.value.length"
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
                    :loading="notificationStore.loading.value"
                    @mark-read="handleMarkRead"
                    @delete="handleDelete"
                />
            </div>
        </div>
    </div>
</template>
