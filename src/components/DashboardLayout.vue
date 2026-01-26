<script lang="ts" setup>
import Add from "@/components/icons/Add.vue";
import Bell from "@/components/icons/Bell.vue";
import Home from "@/components/icons/Home.vue";
import Video from "@/components/icons/Video.vue";
import Credit from "@/components/icons/Credit.vue";
import Upload from "./icons/Upload.vue";
import NotificationDrawer from "./NotificationDrawer.vue";
import GlobalUploadIndicator from "./GlobalUploadIndicator.vue";
import { cn } from "@/lib/utils";
import { createStaticVNode, ref } from "vue";

const className = ":uno: w-12 h-12 p-2 rounded-2xl hover:bg-primary/15 flex press-animated items-center justify-center";
const homeHoist = createStaticVNode(`<img class="h-8 w-8" src="/apple-touch-icon.png" alt="Logo" />`, 1);
const profileHoist = createStaticVNode(`<div class="h-[38px] w-[38px] rounded-full m-a ring-2 ring flex press-animated">
                <img class="h-8 w-8 rounded-full m-a ring-1 ring-white"
                    src="https://picsum.photos/seed/user123/40/40.jpg" alt="User avatar" />
            </div>`, 1);
const notificationPopover = ref<InstanceType<typeof NotificationDrawer>>();
const isNotificationOpen = ref(false);

const handleNotificationClick = (event: Event) => {
    notificationPopover.value?.toggle(event);
};
const links = [
    { href: "/#home", label: "app", icon: homeHoist, type: "btn", className },
    { href: "/", label: "Overview", icon: Home, type: "a", className },
    { href: "/upload", label: "Upload", icon: Upload, type: "a", className },
    { href: "/video", label: "Video", icon: Video, type: "a", className },
    { href: "/payments-and-plans", label: "Payments & Plans", icon: Credit, type: "a", className },
    { href: "/notification", label: "Notification", icon: Bell, type: "btn", className, action: handleNotificationClick, isActive: isNotificationOpen },
    { href: "/profile", label: "Profile", icon: profileHoist, type: "a", className: 'w-12 h-12 rounded-2xl hover:bg-primary/15 flex' },
];


</script>

<template>
    <header
        class=":uno: fixed left-0 w-18 flex flex-col items-center pt-4 gap-6 z-41 max-h-screen h-screen border-r border-gray-200 bg-white">
        <template v-for="i in links" :key="i.label">
            <component :name="i.label" :is="i.type === 'a' ? 'router-link' : 'div'"
                v-bind="i.type === 'a' ? { to: i.href } : {}" v-tooltip="i.label" @click="i.action && i.action($event)"
                :class="cn(i.className, ($route.path === i.href || i.isActive?.value) && 'bg-primary/15')">
                <component :is="i.icon" class="w-6 h-6" :filled="$route.path === i.href || i.isActive?.value" />
            </component>
        </template>
        <ClientOnly>
            <NotificationDrawer ref="notificationPopover" @change="(val) => isNotificationOpen = val" />
        </ClientOnly>
    </header>



    <main class="flex flex-1 overflow-hidden md:ps-18">
        <div class=":uno: flex-1 overflow-auto p-4 bg-[#FAF8F8] rounded-lg md:(mr-2 mb-2) min-h-[calc(100vh-8rem)]">
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
    </main>
</template>
