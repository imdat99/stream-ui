<script setup lang="ts">
interface AvatarProps {
  label?: string;
  shape?: 'circle' | 'square';
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<AvatarProps>(), {
  shape: 'circle',
  size: 'medium',
});

const sizeClasses = {
  small: 'w-8 h-8 text-xs',
  medium: 'w-10 h-10 text-sm',
  large: 'w-12 h-12 text-base',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};
</script>

<template>
  <div
    :class="[
      'inline-flex items-center justify-center font-medium bg-gray-200 text-gray-600',
      sizeClasses[size],
      shapeClasses[shape],
    ]"
  >
    <slot>
      {{ label?.charAt(0).toUpperCase() || '?' }}
    </slot>
  </div>
</template>
