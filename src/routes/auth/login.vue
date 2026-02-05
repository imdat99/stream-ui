<template>
    <div class="w-full">
        <Toast />
        <Form
            :initialValues="initialValues"
            :validators="validators"
            @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full"
        >
            <Field name="email" label="Email">
                <template #default="{ value, error, isInvalid }">
                    <Input
                        name="email"
                        type="text"
                        placeholder="Enter your email"
                        :modelValue="value"
                        :disabled="auth.loading"
                    />
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <Field name="password" label="Password">
                <template #default="{ value, error, isInvalid }">
                    <Input
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        :modelValue="value"
                        :disabled="auth.loading"
                    />
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <input
                        id="remember-me"
                        type="checkbox"
                        v-model="initialValues.rememberMe"
                        class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <label for="remember-me" class="text-sm text-gray-900">Remember me</label>
                </div>
                <div class="text-sm">
                    <router-link to="/forgot"
                        class="text-blue-600 hover:text-blue-500 hover:underline">Forgot
                        password?</router-link>
                </div>
            </div>

            <Button type="submit" :label="auth.loading ? 'Signing in...' : 'Sign in'" :loading="auth.loading" />

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button type="button" variant="outlined" label="Google" :loading="auth.loading" @click="loginWithGoogle">
                <template #default>
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                </template>
            </Button>
            <div class="mt-2 flex flex-col items-center justify-center gap-1 text-sm text-gray-600">
                <p class="text-center text-sm text-gray-600">
                    Don't have an account?
                    <router-link to="/sign-up" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign up</router-link>
                </p>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { Button, Field, Form, Input, Toast } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import { inject, reactive, watch } from 'vue';

const auth = useAuthStore();
const toast = inject<{ add: (t: any) => void }>('toast');

watch(() => auth.error, (newError) => {
    if (newError && toast) {
        toast.add({ severity: 'error', summary: String(auth.error), detail: newError, life: 5000 });
    }
});

const initialValues = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const validators = {
    email: [
        (value: string) => !value ? 'Email or username is required.' : undefined,
    ],
    password: [
        (value: string) => !value ? 'Password is required.' : undefined,
    ],
};

const onFormSubmit = async (values: Record<string, any>) => {
    auth.login(values.email, values.password);
};

const loginWithGoogle = () => {
    auth.loginWithGoogle();
};
</script>
