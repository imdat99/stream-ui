<template>
  <div class="w-full">
    <Toast />
    <Form
      :initial-values="initialValues"
      :resolver="loginSchema"
      class="flex flex-col gap-4 w-full"
      @submit="onFormSubmit"
    >
      <template #default="{ form }">
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-gray-700">Email</label>
          <Input
            name="email"
            type="text"
            placeholder="Enter your email"
            fluid
            :disabled="auth.loading"
          />
          <Message
            v-if="form.getFieldMeta('email')?.errorMap?.onChange"
            severity="error"
            size="sm"
          >
            {{ form.getFieldMeta('email')?.errorMap?.onChange }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-gray-700">Password</label>
          <InputPassword
            name="password"
            placeholder="Enter your password"
            :feedback="false"
            fluid
            :disabled="auth.loading"
          />
          <Message
            v-if="form.getFieldMeta('password')?.errorMap?.onChange"
            severity="error"
            size="sm"
          >
            {{ form.getFieldMeta('password')?.errorMap?.onChange }}
          </Message>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Checkbox
              :model-value="form.getFieldValue('rememberMe')"
              binary
              :disabled="auth.loading"
              @update:model-value="form.setFieldValue('rememberMe', $event)"
            />
            <label for="remember-me" class="text-sm text-gray-900">Remember me</label>
          </div>
          <div class="text-sm">
            <router-link
              to="/forgot"
              class="text-blue-600 hover:text-blue-500 hover:underline"
            >
              Forgot password?
            </router-link>
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          :loading="auth.loading"
          fluid
        >
          {{ auth.loading ? 'Signing in...' : 'Sign in' }}
        </Button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          size="sm"
          type="button"
          variant="outline"
          class="w-full flex items-center justify-center gap-2"
          :disabled="auth.loading"
          @click="loginWithGoogle"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Google
        </Button>

        <div class="mt-2 flex flex-col items-center justify-center gap-1 text-sm text-gray-600">
          <p class="text-center text-sm text-gray-600">
            Don't have an account?
            <router-link
              to="/sign-up"
              class="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign up
            </router-link>
          </p>
        </div>
      </template>
    </Form>
  </div>
</template>

<script setup lang="ts">
import Form from '@/components/form/Form.vue'
import Message from '@/components/form/Message.vue'
import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Input from '@/components/ui/Input.vue'
import InputPassword from '@/components/ui/InputPassword.vue'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { reactive, watch } from 'vue'
import { z } from 'zod'

const auth = useAuthStore()
const toast = useToast()

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email or username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' })
})

const initialValues = reactive({
  email: '',
  password: '',
  rememberMe: false
})

watch(() => auth.error, (newError) => {
  if (newError) {
    toast.error(String(auth.error), 'Error')
  }
})

const onFormSubmit = async (values: any) => {
  await auth.login(values.email, values.password)
}

const loginWithGoogle = () => {
  auth.loginWithGoogle()
}
</script>
