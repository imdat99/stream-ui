<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    notification: {
        id: string;
        type: 'info' | 'success' | 'warning' | 'error' | 'video' | 'payment' | 'system';
        title: string;
        message: string;
        time: string;
        read: boolean;
        actionUrl?: string;
        actionLabel?: string;
    };
}

const props = defineProps<Props>();
const emit = defineEmits<{
    markRead: [id: string];
    delete: [id: string];
}>();

const iconClass = computed(() => {
    const icons: Record<string, string> = {
        info: 'i-lucide-info text-blue-500',
        success: 'i-lucide-check-circle text-green-500',
        warning: 'i-lucide-alert-triangle text-amber-500',
        error: 'i-lucide-x-circle text-red-500',
        video: 'i-lucide-video text-purple-500',
        payment: 'i-lucide-credit-card text-emerald-500',
        system: 'i-lucide-settings text-gray-500'
    };
    return icons[props.notification.type] || icons.info;
});

const bgClass = computed(() => {
    return props.notification.read 
        ? 'bg-white hover:bg-gray-50' 
        : 'bg-blue-50/50 hover:bg-blue-50';
});
</script>

<template>
    <div 
        :class="[
            'notification-item p-4 rounded-xl border border-gray-200/80 transition-all duration-200',
            'flex items-start gap-4 group cursor-pointer',
            bgClass
        ]"
        @click="emit('markRead', notification.id)"
    >
        <!-- Icon -->
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span :class="[iconClass, 'w-5 h-5']"></span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
                <h4 :class="['font-semibold text-gray-900', !notification.read && 'text-primary-700']">
                    {{ notification.title }}
                </h4>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ notification.time }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
            
            <!-- Action Button -->
            <router-link 
                v-if="notification.actionUrl" 
                :to="notification.actionUrl"
                class="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline"
            >
                {{ notification.actionLabel || 'View Details' }}
                <span class="i-lucide-arrow-right w-4 h-4"></span>
            </router-link>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button 
                v-if="!notification.read"
                @click.stop="emit('markRead', notification.id)"
                class="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Mark as read"
            >
                <span class="i-lucide-check w-4 h-4"></span>
            </button>
            <button 
                @click.stop="emit('delete', notification.id)"
                class="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete"
            >
                <span class="i-lucide-trash-2 w-4 h-4"></span>
            </button>
        </div>

        <!-- Unread indicator -->
        <div 
            v-if="!notification.read" 
            class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
        ></div>
    </div>
</template>

<style scoped>
.notification-item {
    position: relative;
}
</style>
