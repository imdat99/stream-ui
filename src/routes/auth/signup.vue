<template>
  <div class="w-full">
    <Form
      :initial-values="initialValues"
      :resolver="signupSchema"
      class="flex flex-col gap-4 w-full"
      @submit="onFormSubmit"
    >
      <template #default="{ form }">
        <div class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
          <Input
            name="name"
            placeholder="John Doe"
            fluid
          />
          <Message
            v-if="form.getFieldMeta('name')?.errorMap?.onChange"
            severity="error"
            size="sm"
          >
            {{ form.getFieldMeta('name')?.errorMap?.onChange }}
          </Message>
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

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-gray-700">Password</label>
          <InputPassword
            name="password"
            placeholder="Create a password"
            :feedback="true"
            fluid
          />
          <small class="text-gray-500">Must be at least 8 characters.</small>
          <Message
            v-if="form.getFieldMeta('password')?.errorMap?.onChange"
            severity="error"
            size="sm"
          >
            {{ form.getFieldMeta('password')?.errorMap?.onChange }}
          </Message>
        </div>

        <Button type="submit" size="sm" fluid>
          Create Account
        </Button>

        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Sign in
          </router-link>
        </p>
      </template>
    </Form>
  </div>
</template>

<script setup lang="ts">
import Form from '@/components/form/Form.vue'
import Message from '@/components/form/Message.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import InputPassword from '@/components/ui/InputPassword.vue'
import { useAuthStore } from '@/stores/auth'
import { reactive } from 'vue'
import { z } from 'zod'

const auth = useAuthStore()

const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' })
})

const initialValues = reactive({
  name: '',
  email: '',
  password: ''
})

const onFormSubmit = (values: any) => {
  auth.register(values.name, values.email, values.password)
}
</script>
