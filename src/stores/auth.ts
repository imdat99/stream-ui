import { client, type ModelUser, type ResponseResponse } from '@/api/client';
import { TinyMqttClient } from '@/lib/liteMqtt';
import { useTranslation } from 'i18next-vue';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

type ProfileUpdatePayload = {
    username?: string;
    email?: string;
    language?: string;
    locale?: string;
};

type AuthResponseBody = ResponseResponse & {
    data?: ModelUser | { user?: ModelUser };
};

const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt';

const extractUser = (body?: AuthResponseBody | null): ModelUser | null => {
    const data = body?.data;

    if (!data) return null;
    if (typeof data === 'object' && 'user' in data && data.user) {
        return data.user;
    }

    return data as ModelUser;
};

const getGoogleLoginPath = () => {
    const basePath = client.baseUrl.startsWith('/') ? client.baseUrl : `/${client.baseUrl}`;
    return `${basePath}/auth/google/login`;
};

export const useAuthStore = defineStore('auth', () => {
    const user = ref<ModelUser | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
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

    async function init() {
        if (initialized.value) return;

        try {
            const response = await client.request<AuthResponseBody, ResponseResponse>({
                path: '/me',
                method: 'GET',
                format: 'json',
            });

            const nextUser = extractUser(response.data as AuthResponseBody);
            if (nextUser) {
                user.value = nextUser;
            }
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
            const response = await client.request<AuthResponseBody, ResponseResponse>({
                path: '/me',
                method: 'PUT',
                body: data,
                format: 'json',
            });
            const nextUser = extractUser(response.data as AuthResponseBody);

            if (nextUser) {
                user.value = { ...(user.value ?? {}), ...nextUser } as ModelUser;
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
            await client.request<ResponseResponse, ResponseResponse>({
                path: '/auth/change-password',
                method: 'POST',
                body: {
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                format: 'json',
            });
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
