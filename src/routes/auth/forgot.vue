<template>
  <div class="w-full">
    <Toast />
    <Form
      :initial-values="initialValues"
      :resolver="forgotSchema"
      class="flex flex-col gap-4 w-full"
      @submit="onFormSubmit"
    >
      <template #default="{ form }">
        <div class="text-sm text-gray-600 mb-2">
          Enter your email address and we'll send you a link to reset your password.
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-gray-700">Email address</label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            fluid
          />
          <Message
            v-if="form.getFieldMeta('email')?.errorMap?.onChange"
            severity="error"
            size="sm"
          >
            {{ form.getFieldMeta('email')?.errorMap?.onChange }}
          </Message>
        </div>

        <Button type="submit" size="sm" fluid>
          Send Reset Link
        </Button>

        <div class="text-center mt-2">
          <router-link
            to="/login"
            replace
            class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Sign in
          </router-link>
        </div>
      </template>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { client } from '@/api/client'
import Form from '@/components/form/Form.vue'
import Message from '@/components/form/Message.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Toast from '@/components/ui/Toast.vue'
import { useToast } from '@/composables/useToast'
import { reactive } from 'vue'
import { z } from 'zod'

const toast = useToast()

const forgotSchema = z.object({
  email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' })
})

const initialValues = reactive({
  email: ''
})

const onFormSubmit = async (values: any) => {
  try {
    await client.auth.forgotPasswordCreate({ email: values.email })
    toast.success('Reset link sent', 'Success')
  } catch (error: any) {
    toast.error(error.message || 'An error occurred', 'Error')
  }
}
</script>
