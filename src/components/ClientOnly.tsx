// export default defineComponent((props, context) => {
//     if (typeof window === 'undefined') {
//         return () => context.slots.default ? context.slots.default() : null;
//     }
//     return () => null;
// });

import { defineComponent, onMounted, ref } from "vue";
const ClientOnly = defineComponent({
  name: "ClientOnly",
  setup(_p, { slots }) {
    const isClient = ref(false);

    onMounted(() => {
      isClient.value = true;
    });
    return () => {
      if (isClient.value) {
        return slots.default ? slots.default() : null;
      }
      return null;
    };
  },
});
export default ClientOnly;
