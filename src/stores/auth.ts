import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { client, ResponseResponse, type ModelUser } from '@/api/client';
import { TinyMqttClient } from '@/lib/liteMqtt';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<ModelUser | null>(null);
    const router = useRouter();
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
                router.push('/');
            } else {
                throw new Error('Login failed: No user data received');
            }
        } catch (e: any) {
            console.error(e);
            error.value = 'Login failed: ' + (e.message || 'Unknown error');
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
                throw new Error(body.message || 'Registration failed');
            }
        } catch (e: any) {
            console.error(e);
            error.value = 'Registration failed: ' + (e.message || 'Unknown error');
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function updateProfile(data: { username?: string; email?: string }) {
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
                user.value = { ...user.value, ...body.data };
            }
            return true;
        } catch (e: any) {
            console.error('Update profile error', e);
            error.value = 'Failed to update profile: ' + (e.message || 'Unknown error');
            throw e;
        } finally {
            loading.value = false;
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
            error.value = 'Failed to change password: ' + (e.message || 'Unknown error');
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
        logout: async () => {
            loading.value = true;
            try {
                await client.auth.logoutCreate();
                user.value = null;
                router.push('/login');
            } catch (e: any) {
                console.error('Logout error', e);
                user.value = null;
                router.push('/login');
            } finally {
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
