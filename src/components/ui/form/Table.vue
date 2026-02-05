<script setup lang="ts" generic="T">
interface TableProps<T> {
  value: T[];
  dataKey: string;
  selection?: T[];
  tableStyle?: string;
}

const props = defineProps<TableProps<T>>();

const emit = defineEmits<{
  'update:selection': [value: T[]];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table :class="['w-full', tableStyle]">
      <thead>
        <tr class="border-b border-gray-200 bg-gray-50">
          <slot name="header" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in value"
          :key="String((item as any)[dataKey])"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <slot name="body" :data="item" :index="index" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
