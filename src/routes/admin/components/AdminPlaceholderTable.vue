<script setup lang="ts">
defineProps<{
  columns: string[];
  rows?: number;
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200 text-gray-500">
          <th v-for="column in columns" :key="column" class="py-3 pr-4 font-medium">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in rows ?? 5" :key="i" class="border-b border-gray-100">
          <td v-for="column in columns" :key="column" class="py-3 pr-4 text-gray-700">
            —
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
