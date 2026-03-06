<template>
    <div class="w-full">
        <form @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
            <div class="text-sm text-gray-600 mb-2">
                {{ t('auth.forgot.description') }}
            </div>

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">{{ t('auth.forgot.email') }}</label>
                <AppInput id="email" v-model="form.email" type="email" :placeholder="t('auth.forgot.placeholders.email')" />
                <p v-if="errors.email" class="text-xs text-red-500 mt-0.5">{{ errors.email }}</p>
            </div>

            <AppButton type="submit" class="w-full">{{ t('auth.forgot.sendResetLink') }}</AppButton>

            <div class="text-center mt-2">
                <router-link to="/login" replace
                    class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    {{ t('auth.forgot.backToSignIn') }}
                </router-link>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { client } from '@/api/client';
import { useAppToast } from '@/composables/useAppToast';
import { reactive } from 'vue';
import { useTranslation } from 'i18next-vue';
import { z } from 'zod';

const toast = useAppToast();
const { t } = useTranslation();

const form = reactive({
    email: ''
});

const errors = reactive<{ email?: string }>({});

const schema = z.object({
    email: z.string().min(1, { message: t('auth.forgot.errors.emailRequired') }).email({ message: t('auth.forgot.errors.emailInvalid') })
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
            toast.add({
                severity: 'success',
                summary: t('auth.forgot.toast.successSummary'),
                detail: t('auth.forgot.toast.successDetail'),
                life: 3000,
            });
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: t('auth.forgot.toast.errorSummary'),
                detail: error.message || t('auth.forgot.toast.errorDetail'),
                life: 3000,
            });
        });
};
</script>
