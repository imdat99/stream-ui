<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

interface DialogProps {
  visible: boolean;
  header?: string;
  style?: Record<string, string>;
  closable?: boolean;
  modal?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), {
  closable: true,
  modal: true,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const handleClose = () => {
  if (props.closable) {
    emit('update:visible', false);
  }
};

const handleBackdropClick = () => {
  if (props.modal) {
    handleClose();
  }
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50"
          @click="handleBackdropClick"
        />
        
        <!-- Dialog -->
        <div
          class="relative bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-auto"
          :style="style || { width: '28rem' }"
        >
          <!-- Header -->
          <div v-if="header" class="flex items-center justify-between px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">{{ header }}</h3>
            <button
              v-if="closable"
              @click="handleClose"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-6 pt-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.2s ease;
}

.dialog-enter-from .relative,
.dialog-leave-to .relative {
  transform: scale(0.95);
}
</style>
