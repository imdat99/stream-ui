<script setup lang="ts">
import HardDrive from '@/components/icons/hard-drive.vue';
import Video from '@/components/icons/Video.vue';
import { useUsageQuery } from '@/composables/useUsageQuery';
import { formatBytes } from '@/lib/utils';
import { computed } from 'vue';

defineProps<{}>();
const { data: usageSnapshot } = useUsageQuery();
const dataList = computed(() => [
    {
        id: 'storage',
        title: 'settings.billing.storage',
        description: { key: 'settings.billing.storageUsedOfLimit', params: { used: formatBytes(usageSnapshot.value?.totalStorage ?? 0) } },
        icon: HardDrive,
    },
    {
        id: 'videos',
        title: 'settings.billing.totalVideos',
        description: { key: 'settings.billing.totalVideosUsedOfLimit', params: { used: usageSnapshot.value?.totalVideos ?? 0 } },
        icon: Video,
    },
]);
</script>

<template>
    <div>
        <div class="px-6 py-4 hover:bg-muted/30 transition-all grid grid-cols-1 md:grid-cols-2 gap-6 rounded-md">
            <div v-for="item in dataList" :key="item.id" class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <component :is="item.icon" filled class="w-5 h-5 text-accent" />
                </div>
                <div class="hover:underline">
                    <p class="text-sm font-medium text-foreground">{{ $t(item.title) }}</p>
                    <p class="text-xs text-foreground/60 mt-0.5">{{ $t(item.description.key, item.description.params) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
