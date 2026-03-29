import { useRouteLoading } from "@/composables/useRouteLoading";
import { useAuthStore } from "@/stores/auth";
import { headSymbol, type ReactiveHead, type ResolvableValue } from "@unhead/vue";
import { inject } from "vue";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

type RouteData = RouteRecordRaw & {
  meta?: ResolvableValue<ReactiveHead> & { requiresAuth?: boolean; requiresAdmin?: boolean };
  children?: RouteData[];
};
const routes: RouteData[] = [
  {
    path: "/",
    component: () => import("@/components/RootLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("./home/Layout.vue"),
        children: [
          {
            path: "",
            component: () => import("./home/Home.vue"),
            beforeEnter: (to, from) => {
              const auth = useAuthStore();
              if (auth.user) {
                return { name: "overview" };
              }
            },
          },
          {
            path: "/terms",
            name: "terms",
            component: () => import("./home/Terms.vue"),
          },
          {
            path: "/privacy",
            name: "privacy",
            component: () => import("./home/Privacy.vue"),
          },
        ],
      },
      {
        path: "",
        component: () => import("./auth/layout.vue"),
        beforeEnter: (to, from) => {
          const auth = useAuthStore();
          if (auth.user) {
            return { name: "overview" };
          }
        },
        children: [
          {
            path: "login",
            name: "login",
            component: () => import("./auth/login.vue"),
          },
          {
            path: "sign-up",
            name: "signup",
            component: () => import("./auth/signup.vue"),
          },
          {
            path: "ref/:username",
            name: "referral-entry",
            redirect: (to) => ({ name: "signup", query: { ref: String(to.params.username || "") } }),
          },
          {
            path: "forgot",
            name: "forgot",
            component: () => import("./auth/forgot.vue"),
          },
          {
            path: "auth/google/finalize",
            name: "google-auth-finalize",
            component: () => import("./auth/google-finalize.vue"),
          },
        ],
      },
      {
        path: "",
        component: () => import("@/components/DashboardLayout.vue"),
        meta: { requiresAuth: true },
        children: [
          {
            path: "",
            name: "overview",
            component: () => import("./overview/Overview.vue"),
            meta: {
              head: {
                title: "Overview - Holistream",
              },
            },
          },
          {
            path: "videos",
            children: [
              {
                path: "",
                name: "videos",
                component: () => import("./video/Videos.vue"),
                meta: {
                  head: {
                    title: "Videos - Holistream",
                    meta: [
                      {
                        name: "description",
                        content: "Manage your video content.",
                      },
                    ],
                  },
                },
              },
            ],
          },
          {
            path: "analytics",
            name: "analytics",
            component: () => import("./analytics/Analytics.vue"),
            meta: {
              head: {
                title: "Analytics - Holistream",
              },
            },
          },
          {
            path: "notification",
            name: "notification",
            component: () => import("./notification/Notification.vue"), // TODO: create notification page
            meta: {
              head: {
                title: "Notification - Holistream",
              },
            },
          },
          {
            path: "settings",
            name: "settings",
            component: () => import("./settings/Settings.vue"),
            meta: {
              head: {
                title: "Settings - Holistream",
                meta: [
                  {
                    name: "description",
                    content: "Manage your account settings and preferences.",
                  },
                ],
              },
            },
            redirect: '/settings/security',
            children: [
              {
                path: "security",
                name: "settings-security",
                component: () => import("./settings/SecurityNConnected/SecurityNConnected.vue"),
                meta: {
                  head: {
                    title: "Security & Connected Apps - Holistream",
                  },
                },
              },
              {
                path: "billing",
                name: "settings-billing",
                component: () => import("./settings/Billing/Billing.vue"),
                meta: {
                  head: {
                    title: "Billing & Plans - Holistream",
                    meta: [
                      {
                        name: "description",
                        content: "Manage your plans and billing information.",
                      },
                    ],
                  },
                },
              },
              {
                path: "notifications",
                name: "settings-notifications",
                component: () => import("./settings/NotificationSettings/NotificationSettings.vue"),
                meta: {
                  head: {
                    title: "Notifications - Holistream",
                  },
                },
              },
              {
                path: "player",
                redirect: { name: "settings-player-configs" },
              },
              {
                path: "domains",
                name: "settings-domains",
                component: () => import("./settings/DomainsDns/DomainsDns.vue"),
                meta: {
                  head: {
                    title: "Allowed Domains - Holistream",
                  },
                },
              },
              {
                path: "ads",
                name: "settings-ads",
                component: () => import("./settings/AdsVast/AdsVast.vue"),
                meta: {
                  head: {
                    title: "Ads & VAST - Holistream",
                  },
                },
              },
              {
                path: "popup-ads",
                name: "settings-popup-ads",
                component: () => import("./settings/PopupAds/PopupAds.vue"),
                meta: {
                  head: {
                    title: "Popup Ads - Holistream",
                  },
                },
              },
              {
                path: "player-configs",
                name: "settings-player-configs",
                component: () => import("./settings/PlayerConfigs/PlayerConfigs.vue"),
                meta: {
                  head: {
                    title: "Player Configs - Holistream",
                  },
                },
              },
              {
                path: "danger",
                name: "settings-danger",
                component: () => import("./settings/DangerZone/DangerZone.vue"),
                meta: {
                  head: {
                    title: "Danger Zone - Holistream",
                  },
                },
              },
              {
                path: "admin",
                meta: { requiresAdmin: true },
                redirect: { name: "admin-overview" },
                children: [
                  { path: "users", name: "admin-users", component: () => import("./settings/admin/Users.vue") },
                  { path: "videos", name: "admin-videos", component: () => import("./settings/admin/Videos.vue") },
                  { path: "payments", name: "admin-payments", component: () => import("./settings/admin/Payments.vue") },
                  { path: "plans", name: "admin-plans", component: () => import("./settings/admin/Plans.vue") },
                  { path: "ad-templates", name: "admin-ad-templates", component: () => import("./settings/admin/AdTemplates.vue") },
                  { path: "popup-ads", name: "admin-popup-ads", component: () => import("./settings/admin/PopupAds.vue") },
                  { path: "player-configs", name: "admin-player-configs", component: () => import("./settings/admin/PlayerConfigs.vue") },
                  { path: "jobs", name: "admin-jobs", component: () => import("./settings/admin/Jobs.vue") },
                  { path: "agents", name: "admin-agents", component: () => import("./settings/admin/Agents.vue") },
                  { path: "logs", name: "admin-logs", component: () => import("./settings/admin/Logs.vue") },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("./NotFound.vue"),
      },
    ],
  },
];
const createAppRouter = () => {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory() // server
      : createWebHistory(), // client
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }
      return { top: 0 };
    },
  });

      const loading = useRouteLoading()
  router.beforeEach((to, from) => {
    const auth = useAuthStore();
    const head = inject(headSymbol);
      (head as any).push(to.meta.head || {});
      if (to.fullPath !== from.fullPath && !import.meta.env.SSR) {
          loading.start()
        }
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!auth.user) {
        return { name: "login" };
      }
    }

    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!auth.user) {
        return { name: "login" };
      }

      const role = String(auth.user.role || "").toLowerCase();
      if (role !== "admin") {
        return { name: "overview" };
      }
    }
  });
  router.afterEach(() => {
    loading.finish()
  })

  router.onError(() => {
    loading.fail()
  })
  return router;
};

export default createAppRouter;
