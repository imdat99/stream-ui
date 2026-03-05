<script setup lang="ts">
import XIcon from '@/components/icons/XIcon.vue';
import { cn } from '@/lib/utils';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Ensure client-side only rendering to avoid hydration mismatch
const isMounted = ref(false);
onMounted(() => {
    isMounted.value = true;
});

const props = withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  closable?: boolean;
  maxWidthClass?: string;
}>(), {
  title: '',
  closable: true,
  maxWidthClass: 'max-w-lg',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const { t } = useI18n();

const close = () => {
  emit('update:visible', false);
  emit('close');
};

const onKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return;
  if (!props.closable) return;
  if (e.key === 'Escape') close();
};

watch(
  () => props.visible,
  (v) => {
    if (typeof window === 'undefined') return;
    if (v) window.addEventListener('keydown', onKeydown);
    else window.removeEventListener('keydown', onKeydown);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport v-if="isMounted" to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="visible" class="fixed inset-0 z-[9999]">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/30"
          @click="closable && close()"
          aria-hidden="true"
        />

        <!-- Panel -->
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div :class="cn('w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden', maxWidthClass)">
            <!-- Header slot -->
            <div v-if="$slots.header" class="px-5 py-4 border-b border-border">
              <slot name="header" :close="close" />
            </div>
            <!-- Default title -->
            <div v-else-if="title" class="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <h3 class="text-sm font-semibold text-foreground">
                {{ title }}
              </h3>
              <button
                v-if="closable"
                type="button"
                class="p-1 rounded-md text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                @click="close"
                :aria-label="t('common.close')"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-5">
              <slot />
            </div>

            <!-- Footer slot -->
            <div v-if="$slots.footer" class="px-5 py-4 border-t border-border bg-muted/20">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
