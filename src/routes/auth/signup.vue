<template>
    <div class="w-full">
        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-1">
                <label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
                <InputText size="small" name="name" placeholder="John Doe" fluid />
                <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{
                    $form.name.error?.message }}</Message>
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email address</label>
                <InputText size="small" name="email" type="email" placeholder="you@example.com" fluid />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                    $form.email.error?.message }}</Message>
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <Password name="password" size="small" placeholder="Create a password" :feedback="true" toggleMask fluid
                    :inputStyle="{ width: '100%' }" />
                <small class="text-gray-500">Must be at least 8 characters.</small>
                <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{
                    $form.password.error?.message }}</Message>
            </div>

            <Button type="submit" size="small" label="Create Account" fluid />

            <p class="mt-4 text-center text-sm text-gray-600">
                Already have an account?
                <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign
                    in</router-link>
            </p>
        </Form>
    </div>
</template>

<script setup lang="ts">

import { Form, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { reactive } from 'vue';
import { z } from 'zod';


import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const initialValues = reactive({
    name: '',
    email: '',
    password: ''
});

const resolver = zodResolver(
    z.object({
        name: z.string().min(1, { message: 'Name is required.' }),
        email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
        password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
    })
);

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
    if (valid) {
        auth.register(values.name, values.email, values.password);
    }
};
</script>