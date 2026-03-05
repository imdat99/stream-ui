<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Props {
    loading?: boolean;
    totalCount: number;
    unreadCount: number;
}

defineProps<Props>();
const emit = defineEmits<{
    markAllRead: [];
    clearAll: [];
}>();

const { t } = useI18n();
</script>

<template>
    <div class="notification-header flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <div class="stats flex items-center gap-4">
                <div class="flex items-center gap-2 text-sm">
                    <span class="i-lucide-bell w-4 h-4 text-gray-400"></span>
                    <span class="text-gray-600">{{ t('notification.stats.total', { count: totalCount }) }}</span>
                </div>
                <div v-if="unreadCount > 0" class="flex items-center gap-2 text-sm">
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span class="text-primary font-medium">{{ t('notification.stats.unread', { count: unreadCount }) }}</span>
                </div>
            </div>
        </div>

        <div class="actions flex items-center gap-2">
            <button
                v-if="unreadCount > 0"
                @click="emit('markAllRead')"
                :disabled="loading"
                class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary
                       hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
                <span class="i-lucide-check-check w-4 h-4"></span>
                {{ t('notification.actions.markAllRead') }}
            </button>
            <button
                v-if="totalCount > 0"
                @click="emit('clearAll')"
                :disabled="loading"
                class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600
                       hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
                <span class="i-lucide-trash w-4 h-4"></span>
                {{ t('notification.actions.clearAll') }}
            </button>
        </div>
    </div>
</template>
