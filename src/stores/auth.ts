import { client, type AuthUserPayload, type ResponseResponse } from '@/api/client';
import { TinyMqttClient } from '@/lib/liteMqtt';
import { useTranslation } from 'i18next-vue';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

type ProfileUpdatePayload = {
    username?: string;
    language?: string;
    locale?: string;
};

type AuthResponseBody = ResponseResponse & {
    data?: AuthUserPayload | { user?: AuthUserPayload };
};

const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt';

const extractUser = (body?: AuthResponseBody | null): AuthUserPayload | null => {
    const data = body?.data;

    if (!data) return null;
    if (typeof data === 'object' && 'user' in data && data.user) {
        return data.user;
    }

    return data as AuthUserPayload;
};

const getGoogleLoginPath = () => {
    const basePath = client.baseUrl.startsWith('/') ? client.baseUrl : `/${client.baseUrl}`;
    return `${basePath}/auth/google/login`;
};

export const useAuthStore = defineStore('auth', () => {
    const user = ref<AuthUserPayload | null>(null);
    const router = useRouter();
    const { t, i18next } = useTranslation();
    const loading = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

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

    watch(() => user.value?.id, (userId) => {
        if (import.meta.env.SSR) return;

        clearMqttClient();
        if (!userId) return;
        mqttClient = new TinyMqttClient(
            mqttBrokerUrl,
            [['ecos1231231', userId, '#'].join('/')],
            (topic, message) => {
                console.log(`Tín hiệu nhận được [${topic}]:`, message);
            }
        );
        mqttClient.connect();
    });
    watch(() => user.value?.language, (lng) => i18next.changeLanguage(lng))
    async function fetchMe() {
        const response = await client.me.getMe({ baseUrl: '/r' });

        const nextUser = extractUser(response.data as AuthResponseBody);
        user.value = nextUser;
        i18next.changeLanguage(nextUser?.language)
        return nextUser;
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
            const response = await client.auth.loginCreate({
                email,
                password,
            });
            const nextUser = extractUser(response.data as AuthResponseBody);

            if (!nextUser) {
                throw new Error(t('auth.errors.loginNoUserData'));
            }

            user.value = nextUser;
            await router.push('/');
        } catch (e: any) {
            console.error(e);
            error.value = t('auth.errors.loginFailed', { error: e.message || t('auth.errors.unknown') });
            throw e;
        } finally {
            loading.value = false;
        }
    }

    function loginWithGoogle() {
        if (typeof window === 'undefined') return;
        window.location.assign(getGoogleLoginPath());
    }

    async function register(username: string, email: string, password: string) {
        loading.value = true;
        error.value = null;

        try {
            await client.auth.registerCreate({
                username,
                email,
                password,
            });
            await router.push('/login');
        } catch (e: any) {
            console.error(e);
            error.value = t('auth.errors.registrationFailed', { error: e.message || t('auth.errors.unknown') });
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function updateProfile(data: ProfileUpdatePayload) {
        loading.value = true;
        error.value = null;

        try {
            const response = await client.me.putMe(data, { baseUrl: '/r' });
            const nextUser = extractUser(response.data as AuthResponseBody);

            if (nextUser) {
                user.value = { ...(user.value ?? {}), ...nextUser } as AuthUserPayload;
            }

            return true;
        } catch (e: any) {
            console.error('Update profile error', e);
            error.value = t('auth.errors.updateProfileFailed', { error: e.message || t('auth.errors.unknown') });
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
            await client.auth.changePasswordCreate({
                current_password: currentPassword,
                new_password: newPassword,
            }, { baseUrl: '/r' });
            return true;
        } catch (e: any) {
            console.error('Change password error', e);
            error.value = t('auth.errors.changePasswordFailed', { error: e.message || t('auth.errors.unknown') });
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        loading.value = true;
        error.value = null;

        try {
            await client.auth.logoutCreate();
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            clearMqttClient();
            user.value = null;
            loading.value = false;
            await router.push('/login');
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
        $reset: () => {
            clearMqttClient();
            clearState();
        },
    };
});
