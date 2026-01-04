<template>
    <div class="w-full">
        <Toast />
        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email or Username</label>
                <InputText name="email" type="text" placeholder="admin or user@example.com" fluid
                    :disabled="auth.loading" />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                    $form.email.error?.message }}</Message>
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <Password name="password" placeholder="••••••••" :feedback="false" toggleMask fluid
                    :inputStyle="{ width: '100%' }" :disabled="auth.loading" />
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                    $form.password.error?.message }}</Message>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Checkbox inputId="remember-me" name="rememberMe" binary :disabled="auth.loading" />
                    <label for="remember-me" class="text-sm text-gray-900">Remember me</label>
                </div>
                <div class="text-sm">
                    <router-link to="/forgot"
                        class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Forgot
                        password?</router-link>
                </div>
            </div>

            <Button type="submit" :label="auth.loading ? 'Signing in...' : 'Sign in'" fluid :loading="auth.loading" />

            <div class="relative my-4">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button type="button" variant="outlined" severity="secondary"
                class="w-full flex items-center justify-center gap-2" @click="loginWithGoogle" :disabled="auth.loading">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
            </Button>

            <p class="mt-4 text-center text-sm text-gray-600">
                Don't have an account?
                <router-link to="/sign-up" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign up
                    for free</router-link>
            </p>

            <!-- Hint for demo credentials -->
            <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-xs text-blue-800 font-medium mb-1">Demo Credentials:</p>
                <p class="text-xs text-blue-600">Username: <code class="bg-blue-100 px-1 rounded">admin</code> |
                    Password: <code class="bg-blue-100 px-1 rounded">admin123</code></p>
                <p class="text-xs text-blue-600">Email: <code class="bg-blue-100 px-1 rounded">user@example.com</code> |
                    Password: <code class="bg-blue-100 px-1 rounded">password</code></p>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
const t = useToast();
const auth = useAuthStore();
// const $form = Form.useFormContext();
watch(() => auth.error, (newError) => {
    if (newError) {
        t.add({ severity: 'error', summary: String(auth.error), detail: newError, life: 5000 });
    }
});

const initialValues = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const resolver = zodResolver(
    z.object({
        email: z.string().min(1, { message: 'Email or username is required.' }),
        password: z.string().min(1, { message: 'Password is required.' })
    })
);

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
    if (valid) auth.login(values.email, values.password);
};

const loginWithGoogle = () => {
    console.log('Login with Google');
    // Handle Google login logic here
};
</script>