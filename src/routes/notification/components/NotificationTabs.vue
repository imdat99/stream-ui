<script setup lang="ts">
interface Tab {
    key: string;
    label: string;
    icon: string;
    count?: number;
}

interface Props {
    tabs: Tab[];
    activeTab: string;
}

defineProps<Props>();
const emit = defineEmits<{
    'update:activeTab': [key: string];
}>();
</script>

<template>
    <div class="notification-tabs flex items-center gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="emit('update:activeTab', tab.key)"
            :class="[
                'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'flex items-center justify-center gap-2',
                activeTab === tab.key 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
        >
            <span :class="[tab.icon, 'w-4 h-4']"></span>
            {{ tab.label }}
            <span 
                v-if="tab.count && tab.count > 0" 
                :class="[
                    'px-1.5 py-0.5 text-xs rounded-full min-w-[20px]',
                    activeTab === tab.key 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 text-gray-600'
                ]"
            >
                {{ tab.count > 99 ? '99+' : tab.count }}
            </span>
        </button>
    </div>
</template>
