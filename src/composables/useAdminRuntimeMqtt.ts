import { TinyMqttClient } from "@/lib/liteMqtt";
import { useAuthStore } from "@/stores/auth";
import { computed, onBeforeUnmount, watch } from "vue";

type RuntimeMessage = {
  topic: string;
  payload: any;
};

const mqttBrokerUrl = "wss://mqtt-dashboard.com:8884/mqtt";

export function useAdminRuntimeMqtt(onMessage: (message: RuntimeMessage) => void) {
  const auth = useAuthStore();
  let client: TinyMqttClient | undefined;

  const isAdmin = computed(() => auth.user?.role?.toUpperCase?.() === "ADMIN");

  const connect = () => {
    if (import.meta.env.SSR || !isAdmin.value) return;
    disconnect();
    client = new TinyMqttClient(
      mqttBrokerUrl,
      ["picpic/events", "picpic/logs/#", "picpic/job/+"],
      (topic, raw) => {
        try {
          onMessage({ topic, payload: JSON.parse(raw) });
        } catch {
          onMessage({ topic, payload: raw });
        }
      },
    );
    client.connect();
  };

  const disconnect = () => {
    client?.disconnect();
    client = undefined;
  };

  const stopWatch = watch(
    () => [auth.user?.id, auth.user?.role],
    () => {
      if (isAdmin.value) {
        connect();
      } else {
        disconnect();
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopWatch();
    disconnect();
  });

  return { disconnect };
}
