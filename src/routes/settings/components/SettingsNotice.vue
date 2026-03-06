<script setup lang="ts">
import AlertTriangleIcon from '@/components/icons/AlertTriangleIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import { cn } from '@/lib/utils';
import { computed, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

type Tone = 'info' | 'warning';

const props = withDefaults(defineProps<{
    tone?: Tone;
    title?: string;
    contentClass?: string;
    titleClass?: string;
    iconClass?: string;
}>(), {
    tone: 'info',
    title: '',
    contentClass: 'text-xs text-foreground/70',
    titleClass: 'font-medium text-foreground mb-1',
    iconClass: '',
});

const attrs = useAttrs();

const rootClass = computed(() => cn(
    'flex items-start gap-2 rounded-md border p-4',
    props.tone === 'warning' ? 'border-warning/20 bg-warning/5' : 'border-info/20 bg-info/5',
));

const defaultIconClass = computed(() => cn(
    'mt-0.5 h-4 w-4 shrink-0',
    props.tone === 'warning' ? 'text-warning' : 'text-info',
    props.iconClass,
));
</script>

<template>
    <div v-bind="attrs" :class="rootClass">
        <slot name="icon">
            <component :is="tone === 'warning' ? AlertTriangleIcon : InfoIcon" :class="defaultIconClass" />
        </slot>

        <div :class="contentClass">
            <p v-if="title" :class="titleClass">{{ title }}</p>
            <slot />
        </div>
    </div>
</template>
