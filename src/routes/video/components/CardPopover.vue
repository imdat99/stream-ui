<template>
    <div class="relative" ref="containerRef">
        <button type="button" class="p-1.5 rounded-md hover:bg-gray-100 transition-colors" @click="toggle"
            aria-haspopup="true" :aria-expanded="isOpen">
            <EllipsisVerticalIcon class="w-4 h-4 text-gray-500" />
        </button>

        <Teleport to="body">
            <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false" />
            <Transition enter-active-class="transition duration-100 ease-out"
                enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="isOpen" ref="menuRef"
                    class="fixed z-50 min-w-[160px] bg-white rounded-lg border border-gray-200 shadow-lg py-1"
                    :style="menuStyle">
                    <template v-for="(item, index) in items" :key="index">
                        <div v-if="item.separator" class="h-px bg-gray-200 my-1" />
                        <router-link v-else-if="item.route" :to="item.route"
                            class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            @click="isOpen = false">
                            <component :is="item.icon" class="w-4 h-4" :class="item.iconClass" />
                            <span :class="item.labelClass">{{ item.label }}</span>
                        </router-link>
                        <button v-else type="button"
                            class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm w-full text-left"
                            @click="item.command?.(); isOpen = false">
                            <component :is="item.icon" class="w-4 h-4" :class="item.iconClass" />
                            <span :class="item.labelClass">{{ item.label }}</span>
                        </button>
                    </template>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type { DefineComponent } from 'vue';
import ArrowDownTray from '@/components/icons/ArrowDownTray.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PencilIcon from '@/components/icons/PencilIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import EllipsisVerticalIcon from '@/components/icons/EllipsisVerticalIcon.vue';
import type { ModelVideo } from '@/api/client';
import { useAppToast } from '@/composables/useAppToast';
import { computed, nextTick, ref } from 'vue';
import { useTranslation } from 'i18next-vue';
import type { RouteLocationRaw } from 'vue-router';

const props = defineProps<{
    video: ModelVideo
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();

const toast = useAppToast();
const isOpen = ref(false);
const containerRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();
const menuStyle = ref<Record<string, string>>({});
const { t } = useTranslation();

const videoUrl = computed(() => {
    return `${window.location.origin}/videos/${props.video.id}`;
});

const toggle = async () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        await nextTick();
        positionMenu();
    }
};

const positionMenu = () => {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    menuStyle.value = {
        top: `${rect.bottom + 4}px`,
        left: `${rect.right}px`,
        transform: 'translateX(-100%)',
    };
};

const handleCopyLink = async () => {
    try {
        await navigator.clipboard.writeText(videoUrl.value);
        toast.add({
            severity: 'success',
            summary: t('video.cardPopover.toast.copySuccessSummary'),
            detail: t('video.cardPopover.toast.copySuccessDetail'),
            life: 3000
        });
    } catch {
        toast.add({
            severity: 'error',
            summary: t('video.cardPopover.toast.copyErrorSummary'),
            detail: t('video.cardPopover.toast.copyErrorDetail'),
            life: 3000
        });
    }
};

const handleDownload = () => {
    if (props.video.id) {
        const link = document.createElement('a');
        link.href = props.video.hls_path || videoUrl.value;
        link.download = props.video.title || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.add({
            severity: 'success',
            summary: t('video.cardPopover.toast.downloadSuccessSummary'),
            detail: t('video.cardPopover.toast.downloadSuccessDetail'),
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: t('video.cardPopover.toast.downloadErrorSummary'),
            detail: t('video.cardPopover.toast.downloadErrorDetail'),
            life: 3000
        });
    }
};

const handleDelete = () => {
    emit('delete');
};

interface CustomMenuItem {
    label?: string;
    icon?: DefineComponent<{}, {}, any>;
    iconClass?: string;
    labelClass?: string;
    separator?: boolean;
    route?: RouteLocationRaw;
    command?: () => void;
}

const items = computed<CustomMenuItem[]>(() => [
    {
        label: t('video.cardPopover.download'),
        icon: ArrowDownTray,
        command: handleDownload
    },
    {
        label: t('video.cardPopover.copyLink'),
        icon: LinkIcon,
        command: handleCopyLink
    },
    {
        separator: true
    },
    {
        label: t('video.cardPopover.edit'),
        icon: PencilIcon,
        route: { name: 'video-detail', params: { id: props.video.id } }
    },
    {
        label: t('video.cardPopover.delete'),
        icon: TrashIcon,
        iconClass: 'text-red-500',
        labelClass: 'text-red-500',
        command: handleDelete
    }
]);
</script>
