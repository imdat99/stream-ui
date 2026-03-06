<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from 'i18next-vue';

defineProps<{
    pendingCount?: number;
    visible?: boolean;
}>();

const category = ref('');
const visibility = ref('public');
const { t } = useTranslation();
</script>

<template>
    <div id="bulk-actions" class="mt-10" :class="{ 'hidden opacity-0 translate-y-4': !visible }"
        style="transition: all 500ms;">
        <div class="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
            <div>
                <h4 class="text-lg font-semibold text-slate-900">{{ t('upload.bulkActions.title') }}</h4>
                <p class="text-slate-500 text-sm">{{ t('upload.bulkActions.applyToPending', { count: pendingCount || 0 }) }}</p>
            </div>
            <div class="flex gap-3">
                <select v-model="category"
                    class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                    <option value="">{{ t('upload.bulkActions.selectCategory') }}</option>
                    <option value="learning">{{ t('upload.bulkActions.category.learning') }}</option>
                    <option value="entertainment">{{ t('upload.bulkActions.category.entertainment') }}</option>
                </select>
                <select v-model="visibility"
                    class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-accent outline-none transition">
                    <option value="public">{{ t('upload.bulkActions.visibility.public') }}</option>
                    <option value="private">{{ t('upload.bulkActions.visibility.private') }}</option>
                </select>
            </div>
        </div>
    </div>
</template>
