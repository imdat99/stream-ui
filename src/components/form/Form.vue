<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { type ZodType } from 'zod'

interface Props {
  initialValues?: Record<string, any>
  onSubmit?: (values: any) => void | Promise<void>
  resolver?: ZodType<any>
  class?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [values: any]
}>()

const form = useForm({
  defaultValues: props.initialValues || {},
  onSubmit: async ({ value }) => {
    if (props.onSubmit) {
      await props.onSubmit(value as Record<string, any>)
    }
    emit('submit', value)
  },
  validators: props.resolver
    ? {
        onChange: ({ value }) => {
          const result = props.resolver!.safeParse(value)
          if (result.success) {
            return undefined
          }
          return result.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        }
      }
    : undefined
})

const handleSubmit = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  form.handleSubmit()
}
</script>

<template>
  <form
    :class="props.class"
    @submit="handleSubmit"
  >
    <slot :form="form" />
  </form>
</template>
