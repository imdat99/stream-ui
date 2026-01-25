<script setup lang="ts">
import Popover from 'primevue/popover';
import { computed, ref } from 'vue';
import NotificationItem from '@/routes/notification/components/NotificationItem.vue';

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

const popover = ref<InstanceType<typeof Popover>>();

// Mock notifications data
const notifications = ref<Notification[]>([
    {
        id: '1',
        type: 'video',
        title: 'Video processing complete',
        message: 'Your video "Summer Vacation 2024" has been successfully processed.',
        time: '2 min ago',
        read: false,
        actionUrl: '/video',
        actionLabel: 'View'
    },
    {
        id: '2',
        type: 'payment',
        title: 'Payment successful',
        message: 'Your subscription to Pro Plan has been renewed successfully.',
        time: '1 hour ago',
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: 'Receipt'
    },
    {
        id: '3',
        type: 'warning',
        title: 'Storage almost full',
        message: 'You have used 85% of your storage quota.',
        time: '3 hours ago',
        read: false,
        actionUrl: '/payments-and-plans',
        actionLabel: 'Upgrade'
    },
    {
        id: '4',
        type: 'success',
        title: 'Upload successful',
        message: 'Your video "Product Demo v2" has been uploaded.',
        time: '1 day ago',
        read: true
    }
]);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

const toggle = (event: Event) => {
    popover.value?.toggle(event);
};

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

defineExpose({ toggle });
</script>

<template>
    <Popover ref="popover" appendTo="body" :pt="{
        root: { class: 'notification-popover' },
        content: { class: 'p-0' }
    }">
        <div class="w-[380px] max-h-[480px] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">Notifications</h3>
                    <span 
                        v-if="unreadCount > 0"
                        class="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full"
                    >
                        {{ unreadCount }}
                    </span>
                </div>
                <button 
                    v-if="unreadCount > 0"
                    @click="handleMarkAllRead"
                    class="text-sm text-primary hover:underline font-medium"
                >
                    Mark all read
                </button>
            </div>

            <!-- Notification List -->
            <div class="flex-1 overflow-y-auto">
                <template v-if="notifications.length > 0">
                    <div 
                        v-for="notification in notifications" 
                        :key="notification.id"
                        class="border-b border-gray-50 last:border-0"
                    >
                        <NotificationItem
                            :notification="notification"
                            @mark-read="handleMarkRead"
                            @delete="handleDelete"
                        />
                    </div>
                </template>

                <!-- Empty state -->
                <div v-else class="py-12 text-center">
                    <span class="i-lucide-bell-off w-12 h-12 text-gray-300 mx-auto block mb-3"></span>
                    <p class="text-gray-500 text-sm">No notifications</p>
                </div>
            </div>

            <!-- Footer -->
            <div v-if="notifications.length > 0" class="p-3 border-t border-gray-100 bg-gray-50/50">
                <router-link 
                    to="/notification" 
                    class="block w-full text-center text-sm text-primary font-medium hover:underline"
                    @click="popover?.hide()"
                >
                    View all notifications
                </router-link>
            </div>
        </div>
    </Popover>
</template>

<style>
.notification-popover {
    border-radius: 16px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    overflow: hidden;
}

.notification-popover .p-popover-content {
    padding: 0 !important;
}
</style>
