<script setup lang="ts">
import { cn } from '@/lib/utils';
import { cva } from "class-variance-authority";
import { ButtonHTMLAttributes, computed } from 'vue';
type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type UiButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

const props = withDefaults(
  defineProps<{
    variant?: UiButtonVariant;
    size?: UiButtonSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: ButtonHTMLAttributes['onClick'];
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    disabled: false,
    loading: false,
    type: 'button',
  },
);

const isDisabled = computed(() => props.disabled || props.loading);
const buttonVariants = cva(":uno: inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap shadow-[0_1px_0_rgba(27,31,36,0.04),0_1px_3px_rgba(27,31,36,0.12)] outline-none transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-150 ease-out active:translate-y-[0.5px] hover:shadow-[0_2px_0_rgba(27,31,36,0.06)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-4",
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-primary text-white hover:bg-primaryHover focus-visible:ring-primary/25',
        secondary: 'border-border bg-white text-text hover:bg-header focus-visible:ring-#0969da/20',
        ghost: 'border-transparent bg-transparent text-text hover:bg-header focus-visible:ring-#0969da/20 shadow-none',
        danger: 'border-transparent bg-danger text-white hover:opacity-92 focus-visible:ring-danger/20',
      },
      size: {
        sm: 'min-h-[28px] px-3 text-[12px] leading-[20px]',
        md: 'min-h-[32px] px-3 text-[14px] leading-[20px]',
        lg: 'min-h-[36px] px-4 text-[14px] leading-[20px]',
        icon: 'min-h-0 p-2',
        'icon-sm': 'min-h-0 p-1',
        'icon-lg': 'min-h-0 p-3',
      },
      block: {
        true: 'w-full',
        false: '',
      }
    },
    defaultVariants: {
      variant: props.variant,
      size: props.size,
      block: props.block,
    },
  }
);

</script>

<template>
  <button :type="type" :disabled="isDisabled" :class="cn(buttonVariants({variant, size, block}))" v-on:click="onClick" :aria-busy="loading || undefined">
    <span
      v-if="loading"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
