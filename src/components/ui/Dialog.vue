<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

interface Props {
  visible: boolean
  header?: string
  width?: string
  closable?: boolean
  draggable?: boolean
  modal?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  header: '',
  width: '28rem',
  closable: true,
  draggable: false,
  modal: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const handleClose = () => {
  emit('update:visible', false)
}

const handleBackdropClick = () => {
  if (props.closable) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible && props.closable) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50"
        :class="[modal ? 'bg-black/50' : '']"
        @click="handleBackdropClick"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="visible"
              class="relative bg-white rounded-xl shadow-xl"
              :style="{ width, maxWidth: 'calc(100vw - 2rem)' }"
              :class="props.class"
              @click.stop
            >
              <!-- Header -->
              <div
                v-if="header || $slots.header || closable"
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
              >
                <slot name="header">
                  <h3 class="text-lg font-semibold text-gray-900">{{ header }}</h3>
                </slot>
                <button
                  v-if="closable"
                  type="button"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                  @click="handleClose"
                >
                  <span class="i-heroicons-x-mark w-5 h-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="px-6 py-4">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
