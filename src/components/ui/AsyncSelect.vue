<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Định nghĩa cấu trúc dữ liệu
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
  placeholder: 'Vui lòng chọn...',
  disabled: false
});

// Sử dụng defineModel thay cho props/emits thủ công
const modelValue = defineModel<string | number>();

const options = ref<SelectOption[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    options.value = await props.loadOptions();
  } catch (err) {
    error.value = 'Lỗi kết nối';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Tự động load lại nếu hàm fetch thay đổi
watch(() => props.loadOptions, fetchData);
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="relative w-full max-w-64">
      <select 
        v-model="modelValue"
        :disabled="loading || disabled"
        class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 
               text-gray-700 outline-none transition-all
               focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
               disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
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

      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
        <div class="i-carbon-chevron-down text-lg" />
      </div>
    </div>

    <div v-if="loading" class="flex items-center text-blue-500">
      <div class="i-carbon-circle-dash animate-spin text-xl" />
    </div>

    <button 
      v-if="error" 
      @click="fetchData"
      class="text-xs text-red-500 underline hover:text-red-600 transition"
    >
      Thử lại?
    </button>
  </div>
</template>