import { client as rpcClient } from '@/api/rpcclient';
import { computed, ref } from 'vue';
import { useTranslation } from 'i18next-vue';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'video' | 'payment' | 'system';

export type AppNotification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
    createdAt?: string;
};

type NotificationApiItem = {
    id?: string;
    type?: string;
    title?: string;
    message?: string;
    read?: boolean;
    actionUrl?: string;
    actionLabel?: string;
    createdAt?: string;
};

type IncomingNotificationEnvelope = {
    type?: string;
    payload?: NotificationApiItem;
};

const notifications = ref<AppNotification[]>([]);
const loading = ref(false);
const loaded = ref(false);

const normalizeType = (value?: string): NotificationType => {
    switch ((value || '').toLowerCase()) {
        case 'video':
        case 'payment':
        case 'warning':
        case 'error':
        case 'success':
        case 'system':
            return value as NotificationType;
        default:
            return 'info';
    }
};

const mapNotification = (item: NotificationApiItem): AppNotification => ({
    id: item.id || '',
    type: normalizeType(item.type),
    title: item.title || '',
    message: item.message || '',
    time: '',
    read: Boolean(item.read),
    actionUrl: item.actionUrl || undefined,
    actionLabel: item.actionLabel || undefined,
    createdAt: item.createdAt,
});

const upsertNotification = (item: NotificationApiItem) => {
    const mapped = mapNotification({ ...item, read: item.read ?? false });
    if (!mapped.id) return;

    const index = notifications.value.findIndex(notification => notification.id === mapped.id);
    if (index >= 0) {
        notifications.value[index] = { ...notifications.value[index], ...mapped };
        return;
    }

    notifications.value = [mapped, ...notifications.value];
};

export function useNotifications() {
    const { t, i18next } = useTranslation();

    const formatRelativeTime = (value?: string) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        const diffMs = Date.now() - date.getTime();
        const minutes = Math.max(1, Math.floor(diffMs / 60000));
        if (minutes < 60) return t('notification.time.minutesAgo', { count: minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('notification.time.hoursAgo', { count: hours });
        const days = Math.floor(hours / 24);
        return t('notification.time.daysAgo', { count: Math.max(1, days) });
    };

    const hydrateNotification = (item: NotificationApiItem): AppNotification => ({
        ...mapNotification(item),
        time: formatRelativeTime(item.createdAt),
    });

    const fetchNotifications = async () => {
        loading.value = true;
        try {
            const response = await rpcClient.listNotifications();
            notifications.value = (response.notifications || []).map(hydrateNotification);
            loaded.value = true;
            return notifications.value;
        } finally {
            loading.value = false;
        }
    };

    const ingestRealtimeNotification = (raw: string | IncomingNotificationEnvelope) => {
        try {
            
            const envelope = typeof raw === 'string' ? JSON.parse(raw) as IncomingNotificationEnvelope : raw;
            if (envelope?.type !== 'notification.created' || !envelope.payload) return false;
            upsertNotification(envelope.payload);
            notifications.value = notifications.value.map(item => ({
                ...item,
                time: formatRelativeTime(item.createdAt),
            }));
            return true;
        } catch {
            return false;
        }
    };

    const markRead = async (id: string) => {
        if (!id) return;
        await rpcClient.markNotificationRead({ id });
        const item = notifications.value.find(notification => notification.id === id);
        if (item) item.read = true;
    };

    const deleteNotification = async (id: string) => {
        if (!id) return;
        await rpcClient.deleteNotification({ id });
        notifications.value = notifications.value.filter(notification => notification.id !== id);
    };

    const markAllRead = async () => {
        await rpcClient.markAllNotificationsRead();
        notifications.value = notifications.value.map(item => ({ ...item, read: true }));
    };

    const clearAll = async () => {
        await rpcClient.clearNotifications();
        notifications.value = [];
    };

    const unreadCount = computed(() => notifications.value.filter(item => !item.read).length);

    return {
        notifications,
        loading,
        loaded,
        unreadCount,
        locale: computed(() => i18next.resolvedLanguage),
        fetchNotifications,
        ingestRealtimeNotification,
        markRead,
        deleteNotification,
        markAllRead,
        clearAll,
    };
}
