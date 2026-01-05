import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { client } from '@/api/rpcclient';
import { ref } from 'vue';

interface User {
    id: string;
    username: string;
    email: string;
    name: string;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const router = useRouter();
    const loading = ref(false);
    const error = ref<string | null>(null);
    const csrfToken = ref<string | null>(null);
    const initialized = ref(false);

    // Check auth status on init (reads from cookie)
    async function init() {
        if (initialized.value) return;
        
        try {
            const response = await client.checkAuth();
            if (response.authenticated && response.user) {
                user.value = response.user;
                // Get CSRF token if authenticated
                try {
                    const csrfResponse = await client.getCSRFToken();
                    csrfToken.value = csrfResponse.csrfToken;
                } catch (e) {
                    // CSRF token might not be available yet
                }
            }
        } catch (e) {
            // Not authenticated, that's fine
        } finally {
            initialized.value = true;
        }
    }

    async function login(username: string, password: string) {
        loading.value = true;
        error.value = null;
        return client.login(username, password).then((response) => {
            user.value = response.user;
            csrfToken.value = response.csrfToken;
            router.push('/');
        }).catch((e: any) => {
            // error.value = e.message || 'Login failed';
            error.value = 'Login failed';
            throw e;
        }).finally(() => {
            loading.value = false;
        });
    }

    async function register(username: string, email: string, password: string) {
        loading.value = true;
        error.value = null;
        return client.register({ username, email, password }).then((response) => {
            user.value = response.user;
            csrfToken.value = response.csrfToken;
            router.push('/');
        }).catch((e: any) => {
            // error.value = e.message || 'Registration failed';
            error.value = 'Registration failed';
            throw e;
        }).finally(() => {
            loading.value = false;
        });
    }

    async function logout() {
        return client.logout().then(() => {
            user.value = null;
            csrfToken.value = null;
            router.push('/');
        })
    }

    return { user, loading, error, csrfToken, initialized, init, login, register, logout, $reset: () => {
        user.value = null;
        loading.value = false;
        error.value = null;
        csrfToken.value = null;
        initialized.value = false;
    } };
});
