<script setup lang="ts">
import { useField } from '@tanstack/vue-form';

interface Props {
  name: string
  form?: any
  class?: string
}

const props = defineProps<Props>()

const field = useField({
  name: props.name,
  form: props.form
})
</script>

<template>
  <div :class="props.class">
    <slot :field="field" />
  </div>
</template>
