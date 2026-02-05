<template>
    <div class="w-full">
        <Form
            :initialValues="initialValues"
            :validators="validators"
            @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full"
        >
            <Field name="name" label="Full Name">
                <template #default="{ value, error, isInvalid }">
                    <Input name="name" type="text" placeholder="John Doe" :modelValue="value" />
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <Field name="email" label="Email address">
                <template #default="{ value, error, isInvalid }">
                    <Input name="email" type="email" placeholder="you@example.com" :modelValue="value" />
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <Field name="password" label="Password">
                <template #default="{ value, error, isInvalid }">
                    <Input name="password" type="password" placeholder="Create a password" :modelValue="value" />
                    <small class="text-gray-500">Must be at least 8 characters.</small>
                    <div v-if="isInvalid" class="text-xs text-red-600 mt-1">{{ error }}</div>
                </template>
            </Field>

            <Button type="submit" label="Create Account" />

            <p class="mt-4 text-center text-sm text-gray-600">
                Already have an account?
                <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign in</router-link>
            </p>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { Button, Field, Form, Input } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import { reactive } from 'vue';

const auth = useAuthStore();

const initialValues = reactive({
    name: '',
    email: '',
    password: ''
});

const validators = {
    name: [
        (value: string) => !value ? 'Name is required.' : undefined,
    ],
    email: [
        (value: string) => !value ? 'Email is required.' : undefined,
        (value: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address.' : undefined,
    ],
    password: [
        (value: string) => !value ? 'Password is required.' : undefined,
        (value: string) => value.length < 8 ? 'Password must be at least 8 characters.' : undefined,
    ],
};

const onFormSubmit = (values: Record<string, any>) => {
    auth.register(values.name, values.email, values.password);
};
</script>
