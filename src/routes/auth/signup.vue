<template>
    <div class="w-full">
        <form @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-1">
                <label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
                <AppInput id="name" v-model="form.name" placeholder="John Doe" />
                <p v-if="errors.name" class="text-xs text-red-500 mt-0.5">{{ errors.name }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email address</label>
                <AppInput id="email" v-model="form.email" type="email" placeholder="you@example.com" />
                <p v-if="errors.email" class="text-xs text-red-500 mt-0.5">{{ errors.email }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <div class="relative">
                    <AppInput id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                        placeholder="Create a password" />
                    <button type="button"
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        @click="showPassword = !showPassword" tabindex="-1">
                        <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    </button>
                </div>
                <small class="text-gray-500">Must be at least 8 characters.</small>
                <p v-if="errors.password" class="text-xs text-red-500 mt-0.5">{{ errors.password }}</p>
            </div>

            <AppButton type="submit" class="w-full">Create Account</AppButton>

            <p class="mt-4 text-center text-sm text-gray-600">
                Already have an account?
                <router-link to="/login"
                    class="font-medium text-blue-600 hover:text-blue-500 hover:underline">Sign in</router-link>
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { reactive, ref } from 'vue';
import { z } from 'zod';

const auth = useAuthStore();
const showPassword = ref(false);

const form = reactive({
    name: '',
    email: '',
    password: ''
});

const errors = reactive<{ name?: string; email?: string; password?: string }>({});

const schema = z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
});

const onFormSubmit = () => {
    errors.name = undefined;
    errors.email = undefined;
    errors.password = undefined;

    const result = schema.safeParse(form);
    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof typeof errors;
            if (field in errors) errors[field] = issue.message;
        }
        return;
    }

    auth.register(form.name, form.email, form.password);
};
</script>
