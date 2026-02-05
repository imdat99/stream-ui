<template>
    <div class="w-full">
        <Toast />
        <Form
            :initialValues="initialValues"
            :validators="validators"
            @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full"
        >
            <div class="text-sm text-gray-600 mb-2">
                Enter your email address and we'll send you a link to reset your password.
            </div>

            <Field name="email" label="Email address">
                <template #default="{ value, error, isInvalid }">
                    <Input name="email" type="email" placeholder="you@example.com" :modelValue="value" />
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <Button type="submit" label="Send Reset Link" />

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
        </Form>
    </div>
</template>

<script setup lang="ts">
import { client } from '@/api/client';
import { Button, Field, Form, Input, Toast } from '@/components/ui/form';
import { inject, reactive } from 'vue';

const toast = inject<{ add: (t: any) => void }>('toast');

const initialValues = reactive({
    email: ''
});

const validators = {
    email: [
        (value: string) => !value ? 'Email is required.' : undefined,
        (value: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address.' : undefined,
    ],
};

const onFormSubmit = (values: Record<string, any>) => {
    client.auth.forgotPasswordCreate({ email: values.email })
        .then(() => {
            toast?.add({ severity: 'success', summary: 'Success', detail: 'Reset link sent', life: 3000 });
        })
        .catch((error: any) => {
            toast?.add({ severity: 'error', summary: 'Error', detail: error.message || 'An error occurred', life: 3000 });
        });
};
</script>
