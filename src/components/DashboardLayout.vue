<script lang="ts" setup>
import Upload from "@/routes/upload/Upload.vue";
import DashboardNav from "./DashboardNav.vue";
import GlobalUploadIndicator from "./GlobalUploadIndicator.vue";
import PopupAdsRuntime from "./PopupAdsRuntime.vue";

</script>

<template>
    <DashboardNav />
    <main class="flex flex-1 flex-col transition-all duration-300 ease-in-out bg-white md:ps-18">
        <div class=":uno: flex-1 overflow-auto p-4 bg-white rounded-lg md:(mr-2 mb-2) min-h-[calc(100vh-8rem)]">
            <router-view v-slot="{ Component }">
                <Transition enter-active-class="transition-all duration-300 ease-in-out"
                    enter-from-class="opacity-0 transform translate-y-4"
                    enter-to-class="opacity-100 transform translate-y-0"
                    leave-active-class="transition-all duration-200 ease-in-out"
                    leave-from-class="opacity-100 transform translate-y-0"
                    leave-to-class="opacity-0 transform -translate-y-4" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </router-view>
        </div>
        <GlobalUploadIndicator />
        <Upload />
        <PopupAdsRuntime />
    </main>
</template>
