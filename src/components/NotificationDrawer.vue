<script setup lang="ts">
import NotificationItem from '@/routes/notification/components/NotificationItem.vue';
import { onClickOutside } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

// Ensure client-side only rendering to avoid hydration mismatch
const isMounted = ref(false);
onMounted(() => {
    isMounted.value = true;
});

// Emit event when visibility changes
const emit = defineEmits(['change']);

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

const visible = ref(false);
const drawerRef = ref(null);

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

const toggle = (event?: Event) => {
    console.log(event);
    // Prevent event propagation to avoid immediate closure by onClickOutside
    if (event) {
        // We don't stop propagation here to let other listeners work, 
        // but we might need to ignore the trigger element in onClickOutside
        // However, since the trigger is outside this component, simple toggle logic works 
        // if we use a small delay or ignore ref. 
        // Best approach: "toggle" usually comes from a button click.
    }
    visible.value = !visible.value;
    console.log(visible.value);
};

// Handle click outside
onClickOutside(drawerRef, (event) => {
    // We can just set visible to false. 
    // Note: If the toggle button is clicked, it might toggle it back on immediately 
    // if the click event propagates. 
    // The user calls `toggle` from the parent's button click handler. 
    // If that button is outside `drawerRef` (which it is), this will fire.
    // To avoid conflict, we usually check if the target is the trigger.
    // But we don't have access to the trigger ref here.
    // A common workaround is to use `ignore` option if we had the ref, 
    // or relying on the fact that if this fires, it sets specific state to false.
    // If the button click then fires `toggle`, it might set it true again.
    // Optimization: check if visible is true before closing.
    if (visible.value) {
        visible.value = false;
    }
}, {
    ignore: ['[name="Notification"]'] // Assuming the trigger button has this class or we can suggest adding a class to the trigger
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

watch(visible, (val) => {
    emit('change', val);
});

defineExpose({ toggle });
</script>

<template>
    <Teleport v-if="isMounted" to="body">
        <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-x-4" enter-to-class="opacity-100 translate-x-0"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-4">
            <div v-if="visible" ref="drawerRef"
                class="fixed top-0 left-[80px] bottom-0 w-[380px] bg-white rounded-2xl border border-gray-300 p-3 z-50 flex flex-col shadow-lg my-3">
                <!-- Header -->
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-900">Notifications</h3>
                        <span v-if="unreadCount > 0"
                            class="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                            {{ unreadCount }}
                        </span>
                    </div>
                    <button v-if="unreadCount > 0" @click="handleMarkAllRead"
                        class="text-sm text-primary hover:underline font-medium">
                        Mark all read
                    </button>
                </div>

                <!-- Notification List -->
                <div class="flex flex-col flex-1 overflow-y-auto gap-2">
                    <template v-if="notifications.length > 0">
                        <div v-for="notification in notifications" :key="notification.id"
                            class="border-b border-gray-50 last:border-0">
                            <NotificationItem :notification="notification" @mark-read="handleMarkRead"
                                @delete="handleDelete" isDrawer />
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
                    <router-link to="/notification"
                        class="block w-full text-center text-sm text-primary font-medium hover:underline"
                        @click="visible = false">
                        View all notifications
                    </router-link>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<!-- <style>
.notification-popover {
    border-radius: 16px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    overflow: hidden;
}

.notification-popover .p-popover-content {
    padding: 0 !important;
}
</style> -->
