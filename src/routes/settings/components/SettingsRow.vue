<script setup lang="ts">
import { cn } from '@/lib/utils';
import { computed, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
    title: string;
    description?: string;
    iconBoxClass?: string;
    hoverClass?: string;
    titleClass?: string;
    descriptionClass?: string;
    actionsClass?: string;
    rowClass?: string;
}>(), {
    description: '',
    iconBoxClass: 'bg-muted text-foreground/70',
    hoverClass: 'hover:bg-header',
    titleClass: 'text-sm font-medium text-foreground',
    descriptionClass: 'text-xs text-foreground/60 mt-0.5',
    actionsClass: '',
    rowClass: '',
});

const attrs = useAttrs();

const rootClass = computed(() => cn(
    'flex items-center justify-between gap-4 px-6 py-4 transition-all',
    props.hoverClass,
    props.rowClass,
));

const iconClass = computed(() => cn(
    'w-10 h-10 rounded-md flex items-center justify-center shrink-0',
    props.iconBoxClass,
));

const actionsWrapperClass = computed(() => cn('shrink-0', props.actionsClass));
</script>

<template>
    <div v-bind="attrs" :class="rootClass">
        <div class="flex min-w-0 items-center gap-4">
            <div :class="iconClass">
                <slot name="icon" class="h-6 w-6" />
            </div>

            <div class="min-w-0">
                <p :class="titleClass">{{ title }}</p>
                <p v-if="description" :class="descriptionClass">{{ description }}</p>
            </div>
        </div>

        <div v-if="$slots.actions" :class="actionsWrapperClass">
            <slot name="actions" />
        </div>
    </div>
</template>
