import { client as rpcClient } from "@/api/rpcclient";
import { TinyMqttClient } from "@/lib/liteMqtt";
import type { User } from "@/server/gen/proto/app/v1/common";
import { useTranslation } from "i18next-vue";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

type ProfileUpdatePayload = {
  username?: string;
  email?: string;
  language?: string;
  locale?: string;
};

type AuthUserPayload = User & {
  plan_id?: string;
  plan_expires_at?: string;
  plan_expiring_soon?: boolean;
  wallet_balance?: number;
};

const mqttBrokerUrl = "wss://mqtt-dashboard.com:8884/mqtt";

const normalizeUser = (user: User | null): AuthUserPayload | null => {
  if (!user) return null;

  return {
    ...user,
    plan_id: user.planId,
    plan_expires_at: user.planExpiresAt,
    plan_expiring_soon: user.planExpiringSoon,
    wallet_balance: user.walletBalance,
  };
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUserPayload | null>(null);
  const router = useRouter();
  const { t, i18next } = useTranslation();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);
  const localeTag = computed(() => i18next.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US');
  const currencyFormatter = computed(() => new Intl.NumberFormat(localeTag.value, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
  }));
  const shortDateFormatter = computed(() => new Intl.DateTimeFormat(localeTag.value, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
  }));
  const formatHistoryDate = (value?: string) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return shortDateFormatter.value.format(date);
  };
  const formatMoney = (amount: number) => currencyFormatter.value.format(amount);

  let mqttClient: TinyMqttClient | undefined;
  const clearMqttClient = () => {
    mqttClient?.disconnect();
    mqttClient = undefined;
  };

  const clearState = () => {
    user.value = null;
    loading.value = false;
    error.value = null;
    initialized.value = false;
  };

  watch(
    () => user.value?.id,
    (userId) => {
      if (import.meta.env.SSR) return;

      clearMqttClient();
      if (!userId) return;

      mqttClient = new TinyMqttClient(
        mqttBrokerUrl,
        [["ecos1231231", userId, "#"].join("/")],
        (topic, message) => {
          console.log(`Tín hiệu nhận được [${topic}]:`, message);
        },
      );
      mqttClient.connect();
    },
  );

  watch(() => user.value?.language, (lng) => i18next.changeLanguage(lng));

  async function fetchMe() {
    const response = await rpcClient.getMe();
    const normalized = normalizeUser(response as User | null);
    user.value = normalized;
    i18next.changeLanguage(normalized?.language || "en");
    return normalized;
  }

  async function init() {
    if (initialized.value) return;

    try {
      await fetchMe();
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await rpcClient.login({ email, password });
      const nextUser = normalizeUser(response.user ?? null);

      if (!nextUser) {
        throw new Error(t("auth.errors.loginNoUserData"));
      }

      user.value = nextUser;
      await router.push("/");
    } catch (e: any) {
      error.value = t("auth.errors.loginFailed", {
        error: e.message || t("auth.errors.unknown"),
      });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loginWithGoogle(refUsername?: string) {
    if (typeof window === "undefined") return;
    if (refUsername?.trim()) {
      document.cookie = `ref_username=${encodeURIComponent(refUsername.trim())}; Path=/; Max-Age=900; SameSite=Lax`;
    } else {
      document.cookie = "ref_username=; Path=/; Max-Age=0; SameSite=Lax";
    }
    const response = await rpcClient.getGoogleLoginUrl();
    if (!response.url) {
      throw new Error(t("auth.errors.unknown"));
    }
    window.location.assign(response.url);
  }

  async function register(username: string, email: string, password: string, refUsername?: string) {
    loading.value = true;
    error.value = null;

    try {
      await rpcClient.register({ username, email, password, refUsername: refUsername?.trim() || undefined });
      await router.push("/login");
    } catch (e: any) {
      error.value = t("auth.errors.registrationFailed", {
        error: e.message || t("auth.errors.unknown"),
      });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: ProfileUpdatePayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await rpcClient.updateMe(data);
      const nextUser = normalizeUser(response as User | null);
      if (nextUser) {
        user.value = { ...(user.value ?? {}), ...nextUser };
      }
      return true;
    } catch (e: any) {
      error.value = t("auth.errors.updateProfileFailed", {
        error: e.message || t("auth.errors.unknown"),
      });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function setLanguage(locale: string) {
    if (!user.value?.id) {
      return { ok: true as const, fallbackOnly: true as const };
    }

    try {
      await updateProfile({ language: locale, locale });
      return { ok: true as const, fallbackOnly: false as const };
    } catch (e) {
      return { ok: false as const, fallbackOnly: true as const, error: e };
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    loading.value = true;
    error.value = null;

    try {
      await rpcClient.changePassword({ currentPassword, newPassword });
      return true;
    } catch (e: any) {
      error.value = t("auth.errors.changePasswordFailed", {
        error: e.message || t("auth.errors.unknown"),
      });
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      await rpcClient.logout();
    } catch {
      // ignore
    } finally {
      clearMqttClient();
      user.value = null;
      loading.value = false;
      await router.push("/login");
    }
  }

  return {
    user,
    loading,
    error,
    initialized,
    init,
    fetchMe,
    login,
    loginWithGoogle,
    register,
    updateProfile,
    changePassword,
    setLanguage,
    logout,
    formatHistoryDate,
    formatMoney,
    $reset: () => {
      clearMqttClient();
      clearState();
    },
  };
});
