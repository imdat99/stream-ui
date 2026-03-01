<script setup lang="ts">
import { computed } from 'vue';
import UploadIcon from '@/components/icons/UploadIcon.vue';
import ActivityIcon from '@/components/icons/ActivityIcon.vue';

const props = defineProps<{
    storageUsed: number;
    storageLimit: number;
    uploadsUsed: number;
    uploadsLimit: number;
}>();

const storagePercentage = computed(() =>
    Math.min(Math.round((props.storageUsed / props.storageLimit) * 100), 100)
);
const uploadsPercentage = computed(() =>
    Math.min(Math.round((props.uploadsUsed / props.uploadsLimit) * 100), 100)
);

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Usage Statistics</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Your current resource usage and limits.
            </p>
        </div>
        <div class="p-6 space-y-6">
            <!-- Storage -->
            <div>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                            <ActivityIcon class="w-4 h-4 text-accent" />
                        </div>
                        <span class="text-sm font-medium text-foreground">Storage</span>
                    </div>
                    <span class="text-sm font-semibold text-foreground">{{ storagePercentage }}%</span>
                </div>
                <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                    <div
                        class="bg-primary h-full rounded-full transition-all duration-300"
                        :style="{ width: `${storagePercentage}%` }"
                    ></div>
                </div>
                <p class="text-xs text-foreground/60 mt-2">
                    {{ formatBytes(storageUsed) }} of {{ formatBytes(storageLimit) }} used
                </p>
            </div>

            <!-- Uploads -->
            <div>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                            <UploadIcon class="w-4 h-4 text-info" />
                        </div>
                        <span class="text-sm font-medium text-foreground">Monthly Uploads</span>
                    </div>
                    <span class="text-sm font-semibold text-foreground">{{ uploadsPercentage }}%</span>
                </div>
                <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                    <div
                        class="bg-info h-full rounded-full transition-all duration-300"
                        :style="{ width: `${uploadsPercentage}%` }"
                    ></div>
                </div>
                <p class="text-xs text-foreground/60 mt-2">
                    {{ uploadsUsed }} of {{ uploadsLimit }} uploads
                </p>
            </div>
        </div>
    </div>
</template>
