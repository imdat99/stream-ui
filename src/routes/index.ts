import { type ReactiveHead, type ResolvableValue } from "@unhead/vue";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

type RouteData = RouteRecordRaw & {
  meta?: ResolvableValue<ReactiveHead> & { requiresAuth?: boolean };
  children?: RouteData[];
};
const routes: RouteData[] = [
  {
    path: "/",
    component: () => import("@/components/RootLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("./home/Home.vue"),
        beforeEnter: (to, from, next) => {
          const auth = useAuthStore();
          if (auth.user) {
            next({ name: "overview" });
          } else {
            next();
          }
        },
      },
      {
        path: "",
        component: () => import("./auth/layout.vue"),
        children: [
          {
            path: "login",
            name: "login",
            component: () => import("./auth/login.vue"),
          },
          {
            path: "signup",
            name: "signup",
            component: () => import("./auth/signup.vue"),
          },
          {
            path: "forgot",
            name: "forgot",
            component: () => import("./auth/forgot.vue"),
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
            component: () => import("./add/Add.vue"),
          },
          {
            path: "video",
            name: "video",
            component: () => import("./add/Add.vue"),
          },
          {
            path: "add",
            name: "add",
            component: () => import("./add/Add.vue"),
          },
          {
            path: "notification",
            name: "notification",
            component: () => import("./add/Add.vue"),
          },
        ],
      },
      {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("./NotFound.vue"),
      }
    ],
  },
];
const router = createRouter({
  history: import.meta.env.SSR
    ? createMemoryHistory() // server
    : createWebHistory(), // client
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  console.log("Call on server:", Math.random());
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!auth.user) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
