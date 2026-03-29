<script setup lang="ts">
import Bell from '@/components/icons/Bell.vue';
import CheckIcon from '@/components/icons/CheckIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import { useTranslation } from 'i18next-vue';

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

const { t } = useTranslation();
</script>

<template>
    <div class="notification-header flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <div class="stats flex items-center gap-4">
                <div class="flex items-center gap-2 text-sm">
                    <Bell filled class="w-4 h-4 text-gray-400" />
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
                 <CheckIcon class="w-4 h-4" />
                {{ t('notification.actions.markAllRead') }}
            </button>
            <button
                v-if="totalCount > 0"
                @click="emit('clearAll')"
                :disabled="loading"
                class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600
                       hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
                <TrashIcon class="w-4 h-4" />
                {{ t('notification.actions.clearAll') }}
            </button>
        </div>
    </div>
</template>
