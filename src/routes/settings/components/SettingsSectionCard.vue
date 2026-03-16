<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
    title?: string;
    description?: string;
    bodyClass?: string;
    headerClass?: string;
    titleClass?: string;
    descriptionClass?: string;
}>(), {
    title: '',
    description: '',
    bodyClass: 'divide-y divide-border',
    headerClass: '',
    titleClass: 'text-base font-semibold text-foreground',
    descriptionClass: 'text-sm text-foreground/60 mt-0.5',
});

const attrs = useAttrs();

const rootClass = computed(() => cn(
    'bg-white border border-border rounded-lg',
));
</script>

<template>
    <div v-bind="attrs" :class="rootClass">
        <div
            v-if="title || description || $slots['header-actions']"
            :class="cn(
                'px-6 py-4 border-b border-border bg-header rounded-tl-lg rounded-tr-lg',
                $slots['header-actions'] ? 'flex items-center justify-between gap-4' : '',
                headerClass,
            )"
        >
            <div class="min-w-0">
                <h2 v-if="title" :class="titleClass">{{ title }}</h2>
                <p v-if="description" :class="descriptionClass">{{ description }}</p>
            </div>

            <div v-if="$slots['header-actions']" class="shrink-0">
                <slot name="header-actions" />
            </div>
        </div>

        <div :class="bodyClass">
            <slot />
        </div>
    </div>
</template>
