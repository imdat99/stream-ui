<template>
    <div class="w-full">
        <form @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">{{ t('auth.login.email') }}</label>
                <AppInput id="email" v-model="form.email" type="text" :placeholder="t('auth.signup.placeholders.email')"
                    :disabled="auth.loading" />
                <p v-if="errors.email" class="text-xs text-red-500 mt-0.5">{{ errors.email }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">{{ t('auth.login.password') }}</label>
                <div class="relative">
                    <AppInput id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                        :placeholder="t('auth.signup.placeholders.password')" :disabled="auth.loading" />
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
                <p v-if="errors.password" class="text-xs text-red-500 mt-0.5">{{ errors.password }}</p>
            </div>

            <div class="flex items-center justify-end">
                <div class="text-sm">
                    <router-link to="/forgot"
                        class="text-blue-600 hover:text-blue-500 hover:underline">{{ t('auth.login.forgotPassword') }}</router-link>
                </div>
            </div>

            <AppButton type="submit" :loading="auth.loading" class="w-full">
                {{ auth.loading ? `${t('common.loading')}...` : t('auth.login.signIn') }}
            </AppButton>

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">{{ t('auth.login.google') }}</span>
                </div>
            </div>

            <AppButton type="button" variant="secondary" class="w-full flex items-center justify-center gap-2"
                @click="loginWithGoogle" :disabled="auth.loading">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                {{ t('auth.login.google') }}
            </AppButton>
            <div class="mt-2 flex flex-col items-center justify-center gap-1 text-sm text-gray-600">
                <p class="text-center text-sm text-gray-600">
                    {{ t('auth.login.noAccount') }}
                    <router-link to="/sign-up"
                        class="font-medium text-blue-600 hover:text-blue-500 hover:underline">{{ t('auth.login.signUp') }}</router-link>
                </p>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useAppToast } from '@/composables/useAppToast';
import { reactive, ref } from 'vue';
import { useTranslation } from 'i18next-vue';
import { z } from 'zod';

const toast = useAppToast();
const auth = useAuthStore();
const showPassword = ref(false);
const { t } = useTranslation();

const form = reactive({
    email: '',
    password: '',
    rememberMe: false
});

const errors = reactive<{ email?: string; password?: string }>({});

const schema = z.object({
    email: z.string().min(1, { message: t('auth.login.errors.emailRequired') }),
    password: z.string().min(1, { message: t('auth.login.errors.passwordRequired') })
});

watch(() => auth.error, (newError) => {
    if (newError) {
        toast.add({ severity: 'error', summary: String(auth.error), detail: newError, life: 5000 });
    }
});

const onFormSubmit = () => {
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

    auth.login(form.email, form.password);
};

const loginWithGoogle = () => {
    auth.loginWithGoogle();
};
</script>
