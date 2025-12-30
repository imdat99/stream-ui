import { type ReactiveHead, type ResolvableValue } from "@unhead/vue";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

type RouteData = RouteRecordRaw & {
  meta?: ResolvableValue<ReactiveHead>;
  children?: RouteData[];
};
const routes: RouteData[] = [
  {
    path: "/",
    component: () => import("./home/Home.vue")
  },
];
const router = createRouter({
  history: import.meta.env.SSR
    ? createMemoryHistory() // server
    : createWebHistory(), // client
  routes,
});
export default router;
