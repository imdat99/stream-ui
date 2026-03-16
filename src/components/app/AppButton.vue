<script setup lang="ts">
import { computed } from 'vue';
type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type UiButtonSize = 'sm' | 'md' | 'lg';
const props = withDefaults(
  defineProps<{
    variant?: UiButtonVariant;
    size?: UiButtonSize;
    block?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    block: false,
    disabled: false,
    type: 'button',
  },
);

const classes = computed(() => {
  const variants: Record<UiButtonVariant, string> = {
    primary: 'border-transparent bg-primary text-white hover:bg-primaryHover focus-visible:ring-primary/25',
    secondary: 'border-border bg-white text-text hover:bg-header focus-visible:ring-#0969da/20',
    ghost: 'border-transparent bg-transparent text-text hover:bg-header focus-visible:ring-#0969da/20 shadow-none',
    danger: 'border-transparent bg-danger text-white hover:opacity-92 focus-visible:ring-danger/20',
  };

  const sizes: Record<UiButtonSize, string> = {
    sm: 'min-h-[28px] px-3 text-[12px] leading-[20px]',
    md: 'min-h-[32px] px-3 text-[14px] leading-[20px]',
    lg: 'min-h-[36px] px-4 text-[14px] leading-[20px]',
  };

  return [
    'inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap shadow-primer outline-none transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out active:translate-y-[0.5px] hover:shadow-[0_2px_0_rgba(27,31,36,0.06)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-4',
    variants[props.variant],
    sizes[props.size],
    props.block ? 'w-full' : '',
  ].join(' ');
});
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
