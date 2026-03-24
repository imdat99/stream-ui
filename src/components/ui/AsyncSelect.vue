<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  loadOptions: () => Promise<SelectOption[]>;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Please select...',
  disabled: false,
});

const modelValue = defineModel<string | number>();

const options = ref<SelectOption[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    options.value = await props.loadOptions();
  } catch {
    error.value = 'Failed to load options';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(() => props.loadOptions, fetchData);
</script>

<template>
  <div class="space-y-2">
    <div class="relative w-full">
      <select
        v-model="modelValue"
        :disabled="loading || disabled"
        class="w-full appearance-none rounded-md border border-border bg-header px-3 py-2 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/40">
        <div v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        <div v-else class="i-carbon-chevron-down text-lg" />
      </div>
    </div>

    <button
      v-if="error"
      type="button"
      @click="fetchData"
      class="text-xs font-medium text-danger transition hover:opacity-80"
    >
      {{ error }} · Retry
    </button>
  </div>
</template>
