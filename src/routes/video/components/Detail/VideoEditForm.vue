<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
    title: string;
    description: string;
    saving: boolean;
}>();

const emit = defineEmits<{
    'update:title': [value: string];
    'update:description': [value: string];
    save: [];
    toggleEdit: [];
}>();

const { t } = useI18n();
</script>

<template>
    <div class="mb-4 space-y-3">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('video.detailModal.titleLabel') }}</label>
            <input :value="title" type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :placeholder="t('video.detailModal.titlePlaceholder')"
                @input="$emit('update:title', ($event.target as HTMLInputElement).value)">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('video.detailModal.descriptionLabel') }}</label>
            <textarea :value="description" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :placeholder="t('video.detailModal.descriptionPlaceholder')"
                @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
        <div class="float-right flex gap-2">
            <AppButton size="sm"
                :title="t('video.detailModal.saveChanges')" :disabled="saving" @click="$emit('save')">
                <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span v-if="saving"
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span class="hidden sm:inline">{{ saving ? t('video.detailPage.saving') : t('common.save') }}</span>
            </AppButton>

            <!-- Cancel Button (Edit Mode) -->
            <AppButton variant="danger" size="sm" :title="t('video.detailPage.cancelEditTitle')"
                @click="$emit('toggleEdit')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                    </path>
                </svg>
                <span class="hidden sm:inline">{{ t('common.cancel') }}</span>
            </AppButton>
        </div>
    </div>
</template>
