<script lang="ts" setup>
import Bell from "@/components/icons/Bell.vue";
import Home from "@/components/icons/Home.vue";
import LayoutDashboard from "@/components/icons/LayoutDashboard.vue";
import SettingsIcon from "@/components/icons/SettingsIcon.vue";
import Video from "@/components/icons/Video.vue";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "i18next-vue";
import { computed, createStaticVNode, ref } from "vue";
import NotificationDrawer from "./NotificationDrawer.vue";

const className = ":uno: w-12 h-12 p-2 rounded-2xl hover:bg-primary/15 flex press-animated items-center justify-center shrink-0";
const homeHoist = createStaticVNode(`<img class="h-8 w-8" src="/apple-touch-icon.png" alt="Logo" />`, 1);
const notificationPopover = ref<InstanceType<typeof NotificationDrawer>>();
const isNotificationOpen = ref(false);
const { t } = useTranslation();
const auth = useAuthStore();

const isAdmin = computed(() => String(auth.user?.role || "").toLowerCase() === "admin");

const handleNotificationClick = (event: Event) => {
  notificationPopover.value?.toggle(event);
};

const links = computed<Record<string, any>>(() => {
  const baseLinks = [
    { href: "/#home", label: "app", icon: homeHoist, action: () => {}, className },
    { href: "/", label: t("nav.overview"), icon: Home, action: null, className },
    { href: "/videos", label: t("nav.videos"), icon: Video, action: null, className },
    {
      href: "/notification",
      label: t("nav.notification"),
      icon: Bell,
      className,
      action: handleNotificationClick,
      isActive: isNotificationOpen,
    },
    { href: "/settings", label: t("nav.settings"), icon: SettingsIcon, action: null, className },
  ] as const;
  return baseLinks;
});
</script>

<template>
  <header
    class=":uno: fixed left-0 flex flex-col items-center pt-4 gap-6 z-41 max-h-screen h-screen bg-header transition-all duration-300 ease-in-out w-18 items-center border-r border-border text-foreground/60"
  >
    <template v-for="i in links" :key="i.href">
      <component
        :name="i.label"
        :is="i.action ? 'div' : 'router-link'"
        v-bind="i.action ? {} : { to: i.href }"
        @click="i.action && i.action($event)"
        :class="cn(
          i.className,
          ($route.path === i.href || $route.path.startsWith(i.href + '/') || i.isActive?.value) && 'bg-primary/15',
        )"
      >
        <component
          :is="i.icon"
          class="w-6 h-6 shrink-0"
          :filled="$route.path === i.href || $route.path.startsWith(i.href + '/') || i.isActive?.value"
        />
      </component>
    </template>
  </header>
  <NotificationDrawer ref="notificationPopover" @change="(val) => (isNotificationOpen = val)" />
</template>
