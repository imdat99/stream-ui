import { client, ResponseResponse, type ModelUser } from '@/api/client';
import { TinyMqttClient } from '@/lib/liteMqtt';
import { useTranslation } from 'i18next-vue';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

type ProfileUpdatePayload = { username?: string; email?: string; language?: string; locale?: string };

export const useAuthStore = defineStore('auth', () => {
    const user = ref<ModelUser | null>(null);
    const router = useRouter();
    const { t } = useTranslation();
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
        if (import.meta.env.SSR || !initialized.value || !newUser) return;
        // const locale = getUserPreferredLocale(newUser);
        // const activeLocale = getActiveI18n()?.resolvedLanguage;
        // if (!locale || (activeLocale && normalizeLocale(activeLocale) === locale)) return;
        // applyRuntimeLocale(locale);
        // writeLocaleCookie(locale);
    }, { deep: true });
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
                // const profileLocale = getUserPreferredLocale(user.value);
                // const activeLocale = getActiveI18n()?.resolvedLanguage;
                // if (profileLocale && (!activeLocale || normalizeLocale(activeLocale) !== profileLocale)) {
                //     applyRuntimeLocale(profileLocale);
                //     writeLocaleCookie(profileLocale);
                // }
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
                // const profileLocale = getUserPreferredLocale(user.value);
                // if (profileLocale) {
                //     applyRuntimeLocale(profileLocale);
                //     writeLocaleCookie(profileLocale);
                // }
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
        // const normalizedLocale = normalizeLocale(locale);
        // const previousLocale = resolveUserLocale(user.value);
        
        // applyRuntimeLocale(normalizedLocale);
        // writeLocaleCookie(normalizedLocale);
        const previousUser = user.value ? { ...user.value } : null;

        if (user.value) {
            user.value = {
                ...user.value,
                // language: normalizedLocale,
                // locale: normalizedLocale,
            } as ModelUser;
        }

        if (!user.value?.id) {
            return { ok: true as const, fallbackOnly: true as const };
        }

        try {
            // await updateProfile({ language: normalizedLocale, locale: normalizedLocale });
            return { ok: true as const, fallbackOnly: false as const };
        } catch (e) {
            // applyRuntimeLocale(previousLocale);
            if (previousUser) {
                user.value = previousUser as ModelUser;
            }
            // writeLocaleCookie(normalizedLocale);
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
            // const activeLocale = getActiveI18n()?.resolvedLanguage;
            // const localeBeforeLogout = typeof activeLocale === 'string' ? normalizeLocale(activeLocale) : undefined;
            try {
                await client.auth.logoutCreate();
                user.value = null;
                router.push('/login');
            } catch (e: any) {
                console.error('Logout error', e);
                user.value = null;
                router.push('/login');
            } finally {
                // if (localeBeforeLogout) {
                //     writeLocaleCookie(localeBeforeLogout);
                //     applyRuntimeLocale(localeBeforeLogout);
                // }
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
