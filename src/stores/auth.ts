import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { client, ResponseResponse, type ModelUser } from '@/api/client';
import { defaultLocale, localeCookieKey, type SupportedLocale } from '@/i18n/constants';
import { getActiveI18n, normalizeLocale } from '@/i18n';
import { TinyMqttClient } from '@/lib/liteMqtt';

type ProfileUpdatePayload = { username?: string; email?: string; language?: string; locale?: string };

const cookieMaxAge = 60 * 60 * 24 * 365;

const writeLocaleCookie = (locale: SupportedLocale) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${localeCookieKey}=${encodeURIComponent(locale)}; path=/; max-age=${cookieMaxAge}; samesite=lax`;
};

const resolveUserLocale = (target: Partial<ModelUser> | null | undefined): SupportedLocale => {
    const userLocale = (target as any)?.language ?? (target as any)?.locale;
    return normalizeLocale(typeof userLocale === 'string' ? userLocale : defaultLocale);
};

const applyRuntimeLocale = (locale: SupportedLocale) => {
    const i18n = getActiveI18n();
    if (!i18n) return;
    i18n.global.locale.value = locale;
};

export const useAuthStore = defineStore('auth', () => {
    const user = ref<ModelUser | null>(null);
    const router = useRouter();
    const t = (key: string, params?: Record<string, unknown>) =>
        getActiveI18n()?.global.t(key, params) ?? key;
    const loading = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

    watch(user, (newUser) => {
        if (import.meta.env.SSR) return;
        let client: TinyMqttClient | undefined;
        if (newUser?.id) {
            client = new TinyMqttClient(
            // 'wss://broker.emqx.io:8084/mqtt',
            'wss://mqtt-dashboard.com:8884/mqtt',
            [['ecos1231231',newUser.id,'#'].join("/")],
            (topic, msg) => console.log(`Tín hiệu nhận được [${topic}]:`, msg)
        );
            client.connect();
            // client.auth.clearToken();
        }
        else {
            if(client?.disconnect) client.disconnect();
            client = undefined;
        }
    }, { deep: true });

    watch(user, (newUser) => {
        if (import.meta.env.SSR) return;
        const locale = resolveUserLocale(newUser);
        applyRuntimeLocale(locale);
        writeLocaleCookie(locale);
    }, { deep: true, immediate: true });
    // Initial check for session could go here if there was a /me endpoint or token check
    async function init() {
        if (initialized.value) return;
        await client.request({
            path: '/me',
            method: 'GET',
            format: "json",
        }).then(r => r.json()).then(r => {
            if (r.data) {
                user.value = r.data.user as ModelUser;
                const resolvedLocale = resolveUserLocale(user.value);
                applyRuntimeLocale(resolvedLocale);
            }
        }).catch(() => { }).finally(() => {
            initialized.value = true;
        });
        // client.request<
        //     ResponseResponse & {
        //         data?: ModelUser;
        //     },
        //     ResponseResponse
        // >({
        //     path: '/me',
        //     method: 'GET'
        // }).then(console.log)
        // .finally(() => {
        //     initialized.value = true;
        // });
    }

    async function login(username: string, password: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await client.auth.loginCreate({
                email: username,
                password: password
            });

            // Expected response structure: { data: { code: 200, data: User, message: "..." } } based on typical wrapper + schema
            // BUT client.ts generated code typically returns the body directly in .data property of HttpResponse
            // And schema says ResponseResponse has 'data': {}
            // So: response.data (HttpResponse body) -> .data (ResponseResponse payload)

            const body = response.data as any; // Cast to access potential 'data' property if types are loose
            console.log("body", body);
            if (body && body.data) {
                user.value = body.data.user;
                const resolvedLocale = resolveUserLocale(user.value);
                applyRuntimeLocale(resolvedLocale);
                writeLocaleCookie(resolvedLocale);
                router.push('/');
            } else {
                throw new Error(t('auth.errors.loginNoUserData'));
            }
        } catch (e: any) {
            console.error(e);
            error.value = t('auth.errors.loginFailed', { error: e.message || t('auth.errors.unknown') });
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function loginWithGoogle() {
        // usually this initiates a redirect loop. 
        // Doing it via client.request might follow redirect or return html.
        // Best to just redirect the window.
        window.location.href = `${client.baseUrl}/auth/google/login`;
    }

    async function register(username: string, email: string, password: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await client.auth.registerCreate({
                username,
                email,
                password
            });

            // Check success
            const body = response.data as any;
            if (response.ok) {
                // Auto login or redirect to login? 
                // Usually register returns success, user must login.
                router.push('/login');
            } else {
                throw new Error(body.message || t('auth.errors.registrationFailedFallback'));
            }
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
            const response = await client.request<
                ResponseResponse & { data?: ModelUser },
                ResponseResponse
            >({
                path: '/me',
                method: 'PUT',
                body: data,
                format: 'json'
            });

            const body = response.data as any;
            if (body && body.data) {
                user.value = { ...(user.value ?? {}), ...body.data } as ModelUser;
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
        const normalizedLocale = normalizeLocale(locale);
        const previousLocale = resolveUserLocale(user.value);
        const previousUser = user.value ? { ...user.value } : null;

        applyRuntimeLocale(normalizedLocale);
        writeLocaleCookie(normalizedLocale);

        if (user.value) {
            user.value = {
                ...user.value,
                language: normalizedLocale,
                locale: normalizedLocale,
            } as ModelUser;
        }

        if (!user.value?.id) {
            return { ok: true as const, fallbackOnly: true as const };
        }

        try {
            await updateProfile({ language: normalizedLocale, locale: normalizedLocale });
            return { ok: true as const, fallbackOnly: false as const };
        } catch (e) {
            applyRuntimeLocale(previousLocale);
            if (previousUser) {
                user.value = previousUser as ModelUser;
            }
            writeLocaleCookie(normalizedLocale);
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
                    new_password: newPassword
                },
                format: 'json'
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
        logout: async () => {
            loading.value = true;
            const localeBeforeLogout = resolveUserLocale(user.value);
            try {
                await client.auth.logoutCreate();
                user.value = null;
                router.push('/login');
            } catch (e: any) {
                console.error('Logout error', e);
                user.value = null;
                router.push('/login');
            } finally {
                writeLocaleCookie(localeBeforeLogout);
                applyRuntimeLocale(localeBeforeLogout);
                loading.value = false;
            }
        },
        $reset: () => {
            user.value = null;
            loading.value = false;
            error.value = null;
            initialized.value = false;
        }
    };
});
