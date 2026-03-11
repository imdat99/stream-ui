<script setup lang="ts">
const props = withDefaults(defineProps<{
  columns?: number;
  rows?: number;
}>(), {
  columns: 3,
  rows: 4,
});
</script>

<template>
  <div class="border-b border-border mt-4">
    <table class="w-full">
      <thead class="bg-muted/30">
        <tr>
          <th
            v-for="column in columns"
            :key="column"
            class="px-6 py-3"
          >
            <div class="h-3 w-20 rounded bg-muted/50 animate-pulse" />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr v-for="row in rows" :key="row" class="animate-pulse">
          <td v-for="column in columns" :key="column" class="px-6 py-4">
            <div class="space-y-2">
              <div class="h-4 rounded bg-muted/50" :class="column === columns ? 'ml-auto w-16' : 'w-full max-w-[12rem]'" />
              <div
                v-if="column === 1"
                class="h-3 w-24 rounded bg-muted/40"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
