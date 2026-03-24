<script setup lang="ts">
import ActivityIcon from '@/components/icons/ActivityIcon.vue';
import UploadIcon from '@/components/icons/UploadIcon.vue';

defineProps<{
    storageTitle: string;
    storageDescription: string;
    storagePercentage: number;
    uploadsTitle: string;
    uploadsDescription: string;
    uploadsPercentage: number;
}>();
</script>

<template>
    <div>
        <div class="px-6 py-4 hover:bg-muted/30 transition-all">
            <div class="flex items-center gap-4 mb-3">
                <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <ActivityIcon class="w-5 h-5 text-accent" />
                </div>
                <div>
                    <p class="text-sm font-medium text-foreground">{{ storageTitle }}</p>
                    <p class="text-xs text-foreground/60 mt-0.5">{{ storageDescription }}</p>
                </div>
            </div>
            <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                <div
                    class="bg-primary h-full rounded-full transition-all duration-300"
                    :style="{ width: `${storagePercentage}%` }"
                ></div>
            </div>
        </div>

        <div class="px-6 py-4 hover:bg-muted/30 transition-all border-t border-border">
            <div class="flex items-center gap-4 mb-3">
                <div class="w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0">
                    <UploadIcon class="w-5 h-5 text-info" />
                </div>
                <div>
                    <p class="text-sm font-medium text-foreground">{{ uploadsTitle }}</p>
                    <p class="text-xs text-foreground/60 mt-0.5">{{ uploadsDescription }}</p>
                </div>
            </div>
            <div class="w-full bg-muted/50 rounded-full overflow-hidden" style="height: 6px">
                <div
                    class="bg-info h-full rounded-full transition-all duration-300"
                    :style="{ width: `${uploadsPercentage}%` }"
                ></div>
            </div>
        </div>
    </div>
</template>
