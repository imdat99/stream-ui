<script setup lang="ts">
import NotificationItem from './NotificationItem.vue';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'video' | 'payment' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
}

interface Props {
    notifications: Notification[];
    loading?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
    markRead: [id: string];
    delete: [id: string];
}>();
</script>

<template>
    <div class="notification-list space-y-3">
        <!-- Loading skeleton -->
        <template v-if="loading">
            <div 
                v-for="i in 5" 
                :key="i" 
                class="p-4 rounded-xl border border-gray-200 animate-pulse"
            >
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Notification items -->
        <template v-else-if="notifications.length > 0">
            <NotificationItem
                v-for="notification in notifications"
                :key="notification.id"
                :notification="notification"
                @mark-read="emit('markRead', $event)"
                @delete="emit('delete', $event)"
            />
        </template>

        <!-- Empty state -->
        <div 
            v-else 
            class="py-16 text-center"
        >
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span class="i-lucide-bell-off w-10 h-10 text-gray-400"></span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
            <p class="text-gray-500">You're all caught up! Check back later.</p>
        </div>
    </div>
</template>
