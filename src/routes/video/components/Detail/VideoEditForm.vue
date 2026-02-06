<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
}>();

const emit = defineEmits<{
    'update:title': [value: string];
    'update:description': [value: string];
}>();
</script>

<template>
    <div class="mb-4 space-y-3">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
                :value="title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter video title"
                @input="$emit('update:title', ($event.target as HTMLInputElement).value)">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
                :value="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter video description"
                @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
    </div>
</template>
