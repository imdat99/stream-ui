import { type ReactiveHead, type ResolvableValue } from "@unhead/vue";
import { headSymbol } from '@unhead/vue'
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
                component: () => import("./public-routes/Layout.vue"),
                children: [
                    {
                        path: "",
                        component: () => import("./public-routes/Home.vue"),
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
                        path: "/terms",
                        name: "terms",
                        component: () => import("./public-routes/Terms.vue"),
                    },
                    {
                        path: "/privacy",
                        name: "privacy",
                        component: () => import("./public-routes/Privacy.vue"),
                    },
                ]
            },
            {
                path: "",
                component: () => import("./auth/layout.vue"),
                beforeEnter: (to, from, next) => {
                    const auth = useAuthStore();
                    if (auth.user) {
                        next({ name: "overview" });
                    } else {
                        next();
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
                        meta: {
                            head: {
                                title: 'Overview - Holistream',
                            },
                        }
                    },
                    {
                        path: "upload",
                        name: "upload",
                        component: () => import("./add/Add.vue"),
                        meta: {
                            head: {
                                title: 'Upload - Holistream',
                            },
                        }
                    },
                    {
                        path: "video",
                        name: "video",
                        component: () => import("./add/Add.vue"),
                        meta: {
                            head: {
                                title: 'Videos - Holistream',
                                meta: [
                                    { name: 'description', content: 'Manage your video content.' },
                                ],
                            },
                        }
                    },
                    {
                        path: "plans",
                        name: "plans",
                        component: () => import("./add/Add.vue"),
                        meta: {
                            head: {
                                title: 'Plans & Billing',
                                meta: [
                                    { name: 'description', content: 'Manage your plans and billing information.' },
                                ],
                            },
                        }
                    },
                    {
                        path: "notification",
                        name: "notification",
                        component: () => import("./add/Add.vue"),
                        meta: {
                            head: {
                                title: 'Notification - Holistream',
                            },
                        }
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
const createAppRouter = () => {
    const router = createRouter({
        history: import.meta.env.SSR
            ? createMemoryHistory() // server
            : createWebHistory(), // client
        routes,
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition
            }
            return { top: 0 }
        }
    });

    router.beforeEach((to, from, next) => {
        const auth = useAuthStore();
        const head = inject(headSymbol);
        (head as any).push(to.meta.head || {});
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
    return router;
}

export default createAppRouter;
