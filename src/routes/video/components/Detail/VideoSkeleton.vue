<template>
    <div class="flex flex-col lg:flex-row gap-4">
        <!-- Video Player Skeleton -->
        <div class="md:flex-1 aspect-video rounded-xl bg-gray-200 animate-pulse" />

        <!-- Info Card Skeleton -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <!-- Header Skeleton -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1 space-y-3">
                    <div class="w-3/5 h-8 bg-gray-200 rounded animate-pulse" />
                    <div class="flex items-center gap-4">
                        <div class="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                        <div class="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                        <div class="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                        <div class="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-20 h-8 bg-gray-200 rounded animate-pulse" />
                        <div class="w-16 h-8 bg-gray-200 rounded animate-pulse" />
                        <div class="w-[4.5rem] h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            <!-- Content Grid Skeleton -->
            <div class="grid grid-cols-1">
                <!-- Left Column -->
                <div class="space-y-4">
                    <div class="w-full h-6 bg-gray-200 rounded animate-pulse" />
                    <div class="space-y-3">
                        <div v-for="i in 6" :key="i" class="space-y-1">
                            <div class="w-full h-3.5 bg-gray-200 rounded animate-pulse" />
                            <div class="flex items-center gap-2">
                                <div class="w-full h-7 bg-gray-200 rounded animate-pulse" />
                                <div class="w-8 h-7 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
