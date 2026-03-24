<template>
    <div class="w-full">
        <form @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <div class="flex flex-col gap-1">
                <label for="name" class="text-sm font-medium text-gray-700">{{ t('auth.signup.fullName') }}</label>
                <AppInput id="name" v-model="form.name" :placeholder="t('auth.signup.placeholders.name')" />
                <p v-if="errors.name" class="text-xs text-red-500 mt-0.5">{{ errors.name }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">{{ t('auth.signup.email') }}</label>
                <AppInput id="email" v-model="form.email" type="email" :placeholder="t('auth.signup.placeholders.email')" />
                <p v-if="errors.email" class="text-xs text-red-500 mt-0.5">{{ errors.email }}</p>
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">{{ t('auth.signup.password') }}</label>
                <div class="relative">
                    <AppInput id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                        :placeholder="t('auth.signup.placeholders.password')" />
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
                <small class="text-gray-500">{{ t('auth.signup.passwordHint') }}</small>
                <p v-if="errors.password" class="text-xs text-red-500 mt-0.5">{{ errors.password }}</p>
            </div>

            <div v-if="refUsername" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                Signing up with referral: <span class="font-medium">@{{ refUsername }}</span>
            </div>

            <AppButton type="submit" class="w-full">{{ t('auth.signup.createAccount') }}</AppButton>

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">{{ t('auth.login.google') }}</span>
                </div>
            </div>

            <AppButton type="button" variant="secondary" class="w-full flex items-center justify-center gap-2" @click="signupWithGoogle">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Continue with Google
            </AppButton>

            <p class="mt-4 text-center text-sm text-gray-600">
                {{ t('auth.signup.alreadyHave') }}
                <router-link to="/login"
                    class="font-medium text-blue-600 hover:text-blue-500 hover:underline">{{ t('auth.signup.signIn') }}</router-link>
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed, reactive, ref } from 'vue';
import { useTranslation } from 'i18next-vue';
import { useRoute } from 'vue-router';
import { z } from 'zod';

const auth = useAuthStore();
const route = useRoute();
const showPassword = ref(false);
const { t } = useTranslation();
const refUsername = computed(() => String(route.query.ref || '').trim());

const form = reactive({
    name: '',
    email: '',
    password: ''
});

const errors = reactive<{ name?: string; email?: string; password?: string }>({});

const schema = z.object({
    name: z.string().min(1, { message: t('auth.signup.errors.nameRequired') }),
    email: z.string().min(1, { message: t('auth.signup.errors.emailRequired') }).email({ message: t('auth.signup.errors.emailInvalid') }),
    password: z.string().min(8, { message: t('auth.signup.errors.passwordMin') })
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

    auth.register(form.name, form.email, form.password, refUsername.value || undefined);
};

const signupWithGoogle = () => {
    auth.loginWithGoogle(refUsername.value || undefined);
};
</script>
