import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
// import { client } from '@/api/rpcclient'; // client no longer used for auth actions
import { ref, onMounted } from 'vue';
import { emailAuth, signUp, auth, googleAuth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

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
    const initialized = ref(false);

    // Check auth status on init using Firebase observer
    async function init() {
        if (initialized.value) return;

        return new Promise<void>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    user.value = mapFirebaseUser(currentUser);
                } else {
                    user.value = null;
                }
                initialized.value = true;
                resolve();
                // We could unsubscribe here if we only want initial load, 
                // but keeping it listens for changes (token refresh etc)
                // However, 'init' usually implies just ONCE waiter.
                // For reactivity, user.value is updated.
            });
            // Note: onAuthStateChanged returns an unsubscribe function.
            // If we want to keep listening, we shouldn't unsubscribe immediately, 
            // but for 'await auth.init()' we just want to wait for the first known state.
        });
    }

    function mapFirebaseUser(fwUser: FirebaseUser): User {
        return {
            id: fwUser.uid,
            username: fwUser.email?.split('@')[0] || 'user', // fallback
            email: fwUser.email || '',
            name: fwUser.displayName || fwUser.email?.split('@')[0] || 'User'
        };
    }

    async function login(username: string, password: string) {
        loading.value = true;
        error.value = null;
        // Assuming username is email for Firebase, or we need to look it up?
        // Firebase works with Email. If input is username, this might fail.
        // For now assume email.
        return emailAuth(username, password).then((userCredential) => {
            user.value = mapFirebaseUser(userCredential.user);
            router.push('/');
        }).catch((e: any) => {
            console.error(e);
            error.value = 'Login failed: ' + (e.message || 'Unknown error');
            throw e;
        }).finally(() => {
            loading.value = false;
        });
    }

    async function loginWithGoogle() {
        loading.value = true;
        error.value = null;
        return googleAuth().then((result) => {
            user.value = mapFirebaseUser(result.user);
            router.push('/');
        }).catch((e: any) => {
            console.error(e);
            error.value = 'Google Login failed';
            throw e;
        }).finally(() => {
            loading.value = false;
        });
    }

    async function register(username: string, email: string, password: string) {
        loading.value = true;
        error.value = null;
        return signUp(email, password).then((fwUser) => {
            // update profile with username?
            // updateProfile(fwUser, { displayName: username });
            user.value = mapFirebaseUser(fwUser);
            router.push('/');
        }).catch((e: any) => {
            console.error(e);
            error.value = 'Registration failed: ' + (e.message || 'Unknown error');
            throw e;
        }).finally(() => {
            loading.value = false;
        });
    }

    async function logout() {
        return signOut(auth).then(() => {
            user.value = null;
            router.push('/');
        })
    }
    return {
        user, loading, error, initialized, init, login, loginWithGoogle, register, logout, $reset: () => {
            user.value = null;
            loading.value = false;
            error.value = null;
            initialized.value = false;
        }
    };
});
