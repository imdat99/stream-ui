<script setup lang="ts">
import NotificationItem from '@/routes/notification/components/NotificationItem.vue';
import { useNotifications } from '@/composables/useNotifications';
import { onClickOutside } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';
import { useTranslation } from 'i18next-vue';

const isMounted = ref(false);
onMounted(() => {
    isMounted.value = true;
    void notificationStore.fetchNotifications();
});

const emit = defineEmits(['change']);
const visible = ref(false);
const drawerRef = ref(null);
const { t } = useTranslation();
const notificationStore = useNotifications();

const unreadCount = computed(() => notificationStore.unreadCount.value);
const mutableNotifications = computed(() => notificationStore.notifications.value.slice(0, 8));

const toggle = (event?: Event) => {
    console.log(event);
    visible.value = !visible.value;
    if (visible.value && !notificationStore.loaded.value) {
        void notificationStore.fetchNotifications();
    }
};

onClickOutside(drawerRef, () => {
    if (visible.value) {
        visible.value = false;
    }
}, {
    ignore: ['[name="Notification"]']
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
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-semibold text-gray-900">{{ t('notification.title') }}</h3>
                        <span v-if="unreadCount > 0"
                            class="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                            {{ unreadCount }}
                        </span>
                    </div>
                    <button v-if="unreadCount > 0" @click="handleMarkAllRead"
                        class="text-sm text-primary hover:underline font-medium">
                        {{ t('notification.actions.markAllRead') }}
                    </button>
                </div>

                <div class="flex flex-col flex-1 overflow-y-auto gap-2">
                    <template v-if="notificationStore.loading.value">
                        <div v-for="i in 4" :key="i" class="p-4 rounded-xl border border-gray-200 animate-pulse">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                                <div class="flex-1 space-y-2">
                                    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="mutableNotifications.length > 0">
                        <div v-for="notification in mutableNotifications" :key="notification.id"
                            class="border-b border-gray-50 last:border-0">
                            <NotificationItem :notification="notification" @mark-read="handleMarkRead"
                                @delete="handleDelete" isDrawer />
                        </div>
                    </template>

                    <div v-else class="py-12 text-center">
                        <span class="i-lucide-bell-off w-12 h-12 text-gray-300 mx-auto block mb-3"></span>
                        <p class="text-gray-500 text-sm">{{ t('notification.empty.title') }}</p>
                    </div>
                </div>

                <div v-if="mutableNotifications.length > 0" class="p-3 border-t border-gray-100 bg-gray-50/50">
                    <router-link to="/notification"
                        class="block w-full text-center text-sm text-primary font-medium hover:underline"
                        @click="visible = false">
                        {{ t('notification.actions.viewAll') }}
                    </router-link>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
