<script setup lang="ts">
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { computed, ref } from 'vue';
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

// Mock notifications data
const notifications = ref<Notification[]>([
    {
        id: '1',
        type: 'video',
        title: 'Video processing complete',
        message: 'Your video "Summer Vacation 2024" has been successfully processed and is now ready to stream.',
        time: '2 minutes ago',
        read: false,
        actionUrl: '/video',
        actionLabel: 'View video'
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment successful',
        message: 'Your subscription to Pro Plan has been renewed successfully. Next billing date: Feb 25, 2026.',
        time: '1 hour ago',
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: 'View receipt'
    },
    {
        id: '3',
        type: 'warning',
        title: 'Storage almost full',
        message: 'You have used 85% of your storage quota. Consider upgrading your plan for more space.',
        time: '3 hours ago',
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: 'Upgrade plan'
    },
    {
        id: '4',
        type: 'success',
        title: 'Upload successful',
        message: 'Your video "Product Demo v2" has been uploaded successfully.',
        time: '1 day ago',
        read: true
    },
    {
        id: '5',
        type: 'system',
        title: 'Scheduled maintenance',
        message: 'We will perform scheduled maintenance on Jan 30, 2026 from 2:00 AM to 4:00 AM UTC.',
        time: '2 days ago',
        read: true
    },
    {
        id: '6',
        type: 'info',
        title: 'New feature available',
        message: 'We just launched video analytics! Track your video performance with detailed insights.',
        time: '3 days ago',
        read: true,
        actionUrl: '/video',
        actionLabel: 'Try it now'
    }
]);

const tabs = computed(() => [
    { key: 'all', label: 'All', icon: 'i-lucide-inbox', count: notifications.value.length },
    { key: 'unread', label: 'Unread', icon: 'i-lucide-bell-dot', count: unreadCount.value },
    { key: 'video', label: 'Videos', icon: 'i-lucide-video', count: notifications.value.filter(n => n.type === 'video').length },
    { key: 'payment', label: 'Payments', icon: 'i-lucide-credit-card', count: notifications.value.filter(n => n.type === 'payment').length }
]);

const filteredNotifications = computed(() => {
    if (activeTab.value === 'all') return notifications.value;
    if (activeTab.value === 'unread') return notifications.value.filter(n => !n.read);
    return notifications.value.filter(n => n.type === activeTab.value);
});

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

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
            title="Notifications" 
            description="Stay updated with your latest activities and alerts."
            :breadcrumbs="[
                { label: 'Dashboard', to: '/' },
                { label: 'Notifications' }
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