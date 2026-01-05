<script lang="ts" setup>
import Add from "@/components/icons/Add.vue";
import AddFilled from "@/components/icons/AddFilled.vue";
import Bell from "@/components/icons/Bell.vue";
import BellFilled from "@/components/icons/BellFilled.vue";
import Home from "@/components/icons/Home.vue";
import HomeFilled from "@/components/icons/HomeFilled.vue";
import Video from "@/components/icons/Video.vue";
import VideoFilled from "@/components/icons/VideoFilled.vue";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { createStaticVNode } from "vue";
import Upload from "./icons/Upload.vue";
import UploadFilled from "./icons/UploadFilled.vue";

const auth = useAuthStore();

const className = ":uno: w-12 h-12 p-2 rounded-2xl hover:bg-primary/10 flex press-animated items-center justify-center";
const homeHoist = createStaticVNode(`<img class="h-8 w-8" src="/apple-touch-icon.png" alt="Logo" />`, 1);
const links = [
    { href: "/fdsfsd", label: "app", icon: homeHoist, exact: homeHoist, type: "btn" },
    { href: "/", label: "Home", icon: Home, exact: HomeFilled, type: "a" },
    { href: "/upload", label: "Upload", icon: Upload, exact: UploadFilled, type: "a" },
    { href: "/video", label: "Video", icon: Video, exact: VideoFilled, type: "a" },
    { href: "/add", label: "Add", icon: Add, exact: AddFilled, type: "a" },
    { href: "/notification", label: "Notification", icon: Bell, exact: BellFilled, type: "a" },
];
</script>
<template>
    <header class="fixed left-0 w-18 flex flex-col items-center pt-4 gap-6 z-41 max-h-screen h-screen border-r border-gray-200">
        <component :is="i.type === 'a' ? 'router-link' : 'div'" v-for="i in links" :key="i.label" v-bind="i.type === 'a' ? { to: i.href } : {}" v-tooltip="i.label" :class="cn(className, $route.path === i.href && 'bg-primary/10')">
            <component :is="$route.path === i.href ? i.exact : i.icon" />
        </component>
        <div class="w-12 h-12 rounded-2xl hover:bg-primary/10 flex">
            <button class="h-[38px] w-[38px] rounded-full m-a ring-2 ring flex press-animated" @click="auth.logout()">
                <img class="h-8 w-8 rounded-full m-a ring-1 ring-white"
                    src="https://picsum.photos/seed/user123/40/40.jpg" alt="User avatar" />
            </button>
        </div>
    </header>
    <main class="flex flex-1 overflow-hidden md:ps-18">
        <div class="flex-1 overflow-auto p-4 bg-white rounded-lg md:(mr-2 mb-2) min-h-[calc(100vh-8rem)]">
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
    </main>
</template>
