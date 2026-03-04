<script lang="ts" setup>
import Bell from "@/components/icons/Bell.vue";
import Home from "@/components/icons/Home.vue";
import Video from "@/components/icons/Video.vue";
import SettingsIcon from "@/components/icons/SettingsIcon.vue";
// import Upload from "@/components/icons/Upload.vue";
import { cn } from "@/lib/utils";
import { createStaticVNode, ref } from "vue";
import NotificationDrawer from "./NotificationDrawer.vue";

const className = ":uno: w-12 h-12 p-2 rounded-2xl hover:bg-primary/15 flex press-animated items-center justify-center shrink-0";
const homeHoist = createStaticVNode(`<img class="h-8 w-8" src="/apple-touch-icon.png" alt="Logo" />`, 1);
const notificationPopover = ref<InstanceType<typeof NotificationDrawer>>();
const isNotificationOpen = ref(false);

const handleNotificationClick = (event: Event) => {
    notificationPopover.value?.toggle(event);
};

const links = [
    { href: "/#home", label: "app", icon: homeHoist, type: "btn", className },
    { href: "/", label: "Overview", icon: Home, type: "a", className },
    // { href: "/upload", label: "Upload", icon: Upload, type: "a", className },
    { href: "/videos", label: "Videos", icon: Video, type: "a", className },
    { href: "/notification", label: "Notification", icon: Bell, type: "btn", className, action: handleNotificationClick, isActive: isNotificationOpen },
    { href: "/settings", label: "Settings", icon: SettingsIcon, type: "a", className },
];


//v-tooltip="i.label"
</script>

<template>
    <header
        class=":uno: fixed left-0 flex flex-col items-center pt-4 gap-6 z-41 max-h-screen h-screen bg-muted transition-all duration-300 ease-in-out w-18 items-center">

        <template v-for="i in links" :key="i.label">
            <component :name="i.label" :is="i.type === 'a' ? 'router-link' : 'div'"
                v-bind="i.type === 'a' ? { to: i.href } : {}"
                @click="i.action && i.action($event)"
                :class="cn(
                    i.className,
                    ($route.path === i.href || $route.path.startsWith(i.href+'/') || i.isActive?.value) && 'bg-primary/15'
                )">
                <component :is="i.icon" class="w-6 h-6 shrink-0"
                    :filled="$route.path === i.href || $route.path.startsWith(i.href+'/') || i.isActive?.value" />
            </component>
        </template>
    </header>
    <NotificationDrawer ref="notificationPopover" @change="(val) => isNotificationOpen = val" />
</template>
