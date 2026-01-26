<script setup lang="ts">
import { computed } from 'vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue';
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import XCircleIcon from '@/components/icons/XCircleIcon.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import CreditCardIcon from '@/components/icons/CreditCardIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon.vue';
import CheckMarkIcon from '@/components/icons/CheckMarkIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';

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
    isDrawer?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    markRead: [id: string];
    delete: [id: string];
}>();

const iconComponent = computed(() => {
    const icons: Record<string, any> = {
        info: InfoIcon,
        success: CheckCircleIcon,
        warning: AlertTriangleIcon,
        error: XCircleIcon,
        video: VideoIcon,
        payment: CreditCardIcon,
        system: SettingsIcon
    };
    return icons[props.notification.type] || InfoIcon;
});

const iconColorClass = computed(() => {
    const colors: Record<string, string> = {
        info: 'text-blue-500',
        success: 'text-green-500',
        warning: 'text-amber-500',
        error: 'text-red-500',
        video: 'text-purple-500',
        payment: 'text-emerald-500',
        system: 'text-gray-500'
    };
    return colors[props.notification.type] || 'text-blue-500';
});

const bgClass = computed(() => {
    return props.notification.read
        ? 'bg-white hover:bg-gray-50'
        : 'bg-blue-50/50 hover:bg-blue-50';
});
</script>

<template>
    <div :class="[
        'rounded-xl p-4 border border-gray-200/80 transition-all duration-200',
        'flex items-start gap-4 group cursor-pointer relative',
        bgClass
    ]" @click="emit('markRead', notification.id)">
        <!-- Icon -->
        <div v-if="!isDrawer" class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <component :is="iconComponent" :class="[iconColorClass, 'w-5 h-5']" />
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
            <router-link v-if="notification.actionUrl" :to="notification.actionUrl"
                class="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline">
                {{ notification.actionLabel || 'View Details' }}
                <ArrowRightIcon class="w-4 h-4" />
            </router-link>
        </div>

        <!-- Actions -->
        <div v-if="!isDrawer"
            class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button v-if="!notification.read" @click.stop="emit('markRead', notification.id)"
                class="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                title="Mark as read">
                <CheckMarkIcon class="w-4 h-4" />
            </button>
            <button @click.stop="emit('delete', notification.id)"
                class="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete">
                <TrashIcon class="w-4 h-4" />
            </button>
        </div>

        <!-- Unread indicator -->
        <div v-if="!notification.read"
            class="absolute left-2 top-1/10 -translate-y-1/2 w-2 h-2 rounded-full bg-primary">
        </div>
    </div>
</template>
