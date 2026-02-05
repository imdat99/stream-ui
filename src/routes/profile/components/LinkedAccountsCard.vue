<script setup lang="ts">
import Tag from '@/components/ui/Tag.vue';
</script>

<template>
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Linked Accounts</h3>
    <div class="space-y-4">
      <!-- Placeholder for linked accounts -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span class="i-heroicons-envelope text-gray-600" />
          </div>
          <div>
            <p class="font-medium text-gray-900">Email</p>
            <p class="text-sm text-gray-500">Connected</p>
          </div>
        </div>
        <Tag value="Active" severity="success" />
      </div>
    </div>
  </div>
</template>
