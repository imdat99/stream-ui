<template>
    <div class="w-full">
        <form @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <div class="text-sm text-gray-600 mb-2">
                Enter your email address and we'll send you a link to reset your password.
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email address</label>
                <AppInput id="email" v-model="form.email" type="email" placeholder="you@example.com" />
                <p v-if="errors.email" class="text-xs text-red-500 mt-0.5">{{ errors.email }}</p>
            </div>

            <AppButton type="submit" class="w-full">Send Reset Link</AppButton>

            <div class="text-center mt-2">
                <router-link to="/login" replace
                    class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Sign in
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { client } from '@/api/client';
import { useAppToast } from '@/composables/useAppToast';
import { reactive } from 'vue';
import { z } from 'zod';

const toast = useAppToast();

const form = reactive({
    email: ''
});

const errors = reactive<{ email?: string }>({});

const schema = z.object({
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' })
});

const onFormSubmit = () => {
    errors.email = undefined;

    const result = schema.safeParse(form);
    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof typeof errors;
            if (field in errors) errors[field] = issue.message;
        }
        return;
    }

    client.auth.forgotPasswordCreate({ email: form.email })
        .then(() => {
            toast.add({ severity: 'success', summary: 'Success', detail: 'Reset link sent', life: 3000 });
        })
        .catch((error) => {
            toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'An error occurred', life: 3000 });
        });
};
</script>
