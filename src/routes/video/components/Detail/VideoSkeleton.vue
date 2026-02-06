<script setup lang="ts">
import Skeleton from 'primevue/skeleton';
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Video Player Skeleton -->
        <div class="aspect-video rounded-xl bg-gray-200 animate-pulse" />
        
        <!-- Info Card Skeleton -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <!-- Header Skeleton -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1 space-y-3">
                    <Skeleton width="60%" height="2rem" />
                    <div class="flex items-center gap-4">
                        <Skeleton width="8rem" height="1rem" />
                        <Skeleton width="5rem" height="1rem" />
                        <Skeleton width="4rem" height="1rem" />
                        <Skeleton width="4rem" height="1.5rem" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Skeleton width="5rem" height="2rem" />
                    <Skeleton width="4rem" height="2rem" />
                    <Skeleton width="4.5rem" height="2rem" />
                </div>
            </div>
            
            <!-- Content Grid Skeleton -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Left Column -->
                <div class="space-y-4">
                    <Skeleton width="8rem" height="1.5rem" />
                    <div class="space-y-3">
                        <div v-for="i in 6" :key="i" class="space-y-1">
                            <Skeleton width="30%" height="0.875rem" />
                            <div class="flex items-center gap-2">
                                <Skeleton width="100%" height="1.75rem" />
                                <Skeleton width="2rem" height="1.75rem" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column -->
                <div class="space-y-4">
                    <Skeleton width="8rem" height="1.5rem" />
                    <div class="space-y-3">
                        <div v-for="i in 3" :key="i" class="space-y-1">
                            <Skeleton width="25%" height="0.875rem" />
                            <Skeleton width="50%" height="1.25rem" />
                        </div>
                    </div>
                    <Skeleton width="6rem" height="1.5rem" class="mt-6" />
                    <Skeleton width="100%" height="4rem" />
                </div>
            </div>
        </div>
    </div>
</template>
