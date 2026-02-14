
<template>
    <div class="card flex justify-center">
        <Button type="button" class="!border-none" @click="toggle" severity="secondary" variant="text" aria-haspopup="true" aria-controls="overlay_menu">
            <EllipsisVerticalIcon class="w-4 h-4 text-gray-500" />
        </Button>
        <Menu ref="menu" id="overlay_menu" :model="items as any" :popup="true" class="min-w-[160px]">
            <template #item="{ item, props }">
                <router-link v-if="(item as any).route" v-bind="props.action" :to="(item as any).route" class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                    <component :is="(item as any).icon" class="w-4 h-4" :class="(item as any).iconClass" />
                    <span :class="(item as any).labelClass">{{ item.label }}</span>
                </router-link>
                <a v-else-if="!(item as any).separator" v-bind="props.action" @click="(item as any).command" class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                    <component :is="(item as any).icon" class="w-4 h-4" :class="(item as any).iconClass" />
                    <span :class="(item as any).labelClass">{{ item.label }}</span>
                </a>
            </template>
        </Menu>
    </div>
</template>

<script setup lang="ts">
import type { DefineComponent } from "vue";
import ArrowDownTray from "@/components/icons/ArrowDownTray.vue";
import LinkIcon from "@/components/icons/LinkIcon.vue";
import PencilIcon from "@/components/icons/PencilIcon.vue";
import TrashIcon from "@/components/icons/TrashIcon.vue";
import EllipsisVerticalIcon from "@/components/icons/EllipsisVerticalIcon.vue";
import type { ModelVideo } from '@/api/client';
import { useToast } from "primevue/usetoast";
import Menu from "primevue/menu";
import { computed, ref, shallowRef } from "vue";
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
    video: ModelVideo
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
}>();

const toast = useToast();
const menu = ref<InstanceType<typeof Menu>>();

const videoUrl = computed(() => {
    return `${window.location.origin}/videos/${props.video.id}`;
});

const handleCopyLink = async () => {
    try {
        await navigator.clipboard.writeText(videoUrl.value);
        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã sao chép link video',
            life: 3000
        });
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể sao chép link',
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
            summary: 'Thành công',
            detail: 'Đang tải xuống video...',
            life: 3000
        });
    } else {
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không tìm thấy file video',
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

const items = shallowRef<CustomMenuItem[]>([
    {
        label: 'Tải xuống',
        icon: ArrowDownTray,
        command: handleDownload
    },
    {
        label: 'Sao chép link',
        icon: LinkIcon,
        command: handleCopyLink
    },
    {
        separator: true
    },
    {
        label: 'Chỉnh sửa',
        icon: PencilIcon,
        route: { name: 'video-detail', params: { id: props.video.id } }
    },
    {
        label: 'Xóa',
        icon: TrashIcon,
        iconClass: 'text-red-500',
        labelClass: 'text-red-500',
        command: handleDelete
    }
]);

const toggle = (event: Event) => {
    menu.value?.toggle(event);
};
</script>
