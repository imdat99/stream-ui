<template>
    <div class="w-full">
        <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" @submit="onFormSubmit"
            class="flex flex-col gap-4 w-full">
            <div class="text-sm text-gray-600 mb-2">
                Enter your email address and we'll send you a link to reset your password.
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email address</label>
                <InputText name="email" type="email" placeholder="you@example.com" fluid />
                <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{
                    $form.email.error?.message }}</Message>
            </div>

            <Button type="submit" label="Send Reset Link" fluid />

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
import { reactive } from 'vue';
import { Form, type FormSubmitEvent } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';


const initialValues = reactive({
    email: ''
});

const resolver = zodResolver(
    z.object({
        email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' })
    })
);

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
    if (valid) {
        console.log('Form submitted:', values);
        // toast.add({ severity: 'success', summary: 'Success', detail: 'Reset link sent', life: 3000 });
        // Handle actual forgot password logic here
    }
};
</script>