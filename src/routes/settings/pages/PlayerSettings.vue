<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import PlayIcon from '@/components/icons/PlayIcon.vue';
import RepeatIcon from '@/components/icons/RepeatIcon.vue';
import VolumeOffIcon from '@/components/icons/VolumeOffIcon.vue';
import SlidersIcon from '@/components/icons/SlidersIcon.vue';
import ImageIcon from '@/components/icons/ImageIcon.vue';

const toast = useToast();

const playerSettings = ref({
    autoplay: true,
    loop: false,
    muted: false,
    showControls: true,
    pip: true,
    airplay: true,
    Chromecast: false,
});

const saving = ref(false);

const handleSave = async () => {
    saving.value = true;
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.add({
            severity: 'success',
            summary: 'Settings Saved',
            detail: 'Your player settings have been saved.',
            life: 3000
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: e.message || 'Failed to save settings.',
            life: 5000
        });
    } finally {
        saving.value = false;
    }
};

const settingsItems = [
    {
        key: 'autoplay' as const,
        title: 'Autoplay',
        description: 'Automatically start videos when loaded',
        svg: `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 532 404"><path d="M26 45v314c0 10 9 19 19 19 5 0 9-2 13-5l186-157c4-3 6-9 6-14s-2-11-6-14L58 31c-4-3-8-5-13-5-10 0-19 9-19 19z" class="fill-primary/30"/><path d="M26 359c0 11 9 19 19 19 5 0 9-2 13-4l186-158c4-3 6-9 6-14s-2-11-6-14L58 31c-4-3-8-5-13-5-10 0-19 9-19 19v314zm-16 0V45c0-19 16-35 35-35 8 0 17 3 23 8l186 158c8 6 12 16 12 26s-4 20-12 26L68 386c-6 5-15 8-23 8-19 0-35-16-35-35zM378 18v368c0 4-4 8-8 8s-8-4-8-8V18c0-4 4-8 8-8s8 4 8 8zm144 0v368c0 4-4 8-8 8s-8-4-8-8V18c0-4 4-8 8-8s8 4 8 8z" class="fill-primary"/></svg>`,
    },
    {
        key: 'loop' as const,
        title: 'Loop',
        description: 'Repeat video when it ends',
        svg: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 497 496"><path d="M80 248c0 30 8 58 21 82h65c8 0 14 6 14 14s-6 14-14 14h-45c31 36 76 58 127 58 93 0 168-75 168-168 0-30-8-58-21-82h-65c-8 0-14-6-14-14s6-14 14-14h45c-31-35-76-58-127-58-93 0-168 75-168 168z" class="fill-primary/30"/><path d="M70 358c37 60 103 100 179 100 116 0 210-94 210-210 0-8 6-14 14-14 7 0 14 6 14 14 0 131-107 238-238 238-82 0-154-41-197-104v90c0 8-6 14-14 14s-14-6-14-14V344c0-8 6-14 14-14h128c8 0 14 6 14 14s-6 14-14 14H70zm374-244V24c0-8 6-14 14-14s14 6 14 14v128c0 8-6 14-14 14H330c-8 0-14-6-14-14s6-14 14-14h96C389 78 323 38 248 38 132 38 38 132 38 248c0 8-7 14-14 14-8 0-14-6-14-14C10 117 116 10 248 10c81 0 153 41 196 104z" class="fill-primary"/></svg>`,
    },
    {
        key: 'muted' as const,
        title: 'Muted',
        description: 'Start videos with sound muted',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 549 468"><path d="M26 186v96c0 18 14 32 32 32h64c4 0 8 2 11 5l118 118c4 3 8 5 13 5 10 0 18-8 18-18V44c0-10-8-18-18-18-5 0-9 2-13 5L133 149c-3 3-7 5-11 5H58c-18 0-32 14-32 32z" class="fill-primary/30"/><path d="m133 319 118 118c4 3 8 5 13 5 10 0 18-8 18-18V44c0-10-8-18-18-18-5 0-9 2-13 5L133 149c-3 3-7 5-11 5H58c-18 0-32 14-32 32v96c0 18 14 32 32 32h64c4 0 8 2 11 5zM58 138h64L240 20c7-6 15-10 24-10 19 0 34 15 34 34v380c0 19-15 34-34 34-9 0-17-4-24-10L122 330H58c-26 0-48-21-48-48v-96c0-26 22-48 48-48zm322 18c3-3 9-3 12 0l66 67 66-67c3-3 8-3 12 0 3 3 3 9 0 12l-67 66 67 66c3 3 3 8 0 12-4 3-9 3-12 0l-66-67-66 67c-3 3-9 3-12 0-3-4-3-9 0-12l67-66-67-66c-3-3-3-9 0-12z" class="fill-primary"/></svg>`,
    },
    {
        key: 'showControls' as const,
        title: 'Show Controls',
        description: 'Display player controls (play, pause, volume)',
        svg: `<svg class="h6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 468 468"><path d="M26 74v320c0 27 22 48 48 48h320c27 0 48-21 48-48V74c0-26-21-48-48-48H74c-26 0-48 22-48 48zm48 72c0-4 4-8 8-8h56v-24c0-18 14-32 32-32s32 14 32 32v24h184c4 0 8 4 8 8s-4 8-8 8H202v24c0 18-14 32-32 32s-32-14-32-32v-24H82c-4 0-8-4-8-8zm0 176c0-4 4-8 8-8h184v-24c0-18 14-32 32-32s32 14 32 32v24h56c4 0 8 4 8 8s-4 8-8 8h-56v24c0 18-14 32-32 32s-32-14-32-32v-24H82c-4 0-8-4-8-8z" class="fill-primary/30"/><path d="M442 74c0-26-21-48-48-48H74c-26 0-48 22-48 48v320c0 27 22 48 48 48h320c27 0 48-21 48-48V74zm16 320c0 35-29 64-64 64H74c-35 0-64-29-64-64V74c0-35 29-64 64-64h320c35 0 64 29 64 64v320zm-64-72c0 4-4 8-8 8h-56v24c0 18-14 32-32 32s-32-14-32-32v-24H82c-4 0-8-4-8-8s4-8 8-8h184v-24c0-18 14-32 32-32s32 14 32 32v24h56c4 0 8 4 8 8zm-112 0v32c0 9 7 16 16 16s16-7 16-16v-64c0-9-7-16-16-16s-16 7-16 16v32zm104-184c4 0 8 4 8 8s-4 8-8 8H202v24c0 18-14 32-32 32s-32-14-32-32v-24H82c-4 0-8-4-8-8s4-8 8-8h56v-24c0-18 14-32 32-32s32 14 32 32v24h184zm-232-24v64c0 9 7 16 16 16s16-7 16-16v-64c0-9-7-16-16-16s-16 7-16 16z" class="fill-primary"/></svg>`
    },
    {
        key: 'pip' as const,
        title: 'Picture in Picture',
        description: 'Enable Picture-in-Picture mode',
        svg: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 532 468"><path d="M26 74c0-26 22-48 48-48h384c27 0 48 22 48 48v112H314c-53 0-96 43-96 96v160H74c-26 0-48-21-48-48V74z" class="fill-primary/30"/><path d="M458 10c35 0 64 29 64 64v112h-16V74c0-26-21-48-48-48H74c-26 0-48 22-48 48v320c0 27 22 48 48 48h144v16H68c-31-3-55-27-58-57V74c0-33 25-60 58-64h390zm16 224c27 0 48 22 48 48v133c-3 24-23 43-48 43H309c-22-2-40-20-43-43V282c0-26 22-48 48-48h160zm-160 16c-18 0-32 14-32 32v128c0 18 14 32 32 32h160c18 0 32-14 32-32V282c0-18-14-32-32-32H314z" class="fill-primary"/></svg>`
    },
    {
        key: 'airplay' as const,
        title: 'AirPlay',
        description: 'Allow streaming to Apple devices via AirPlay',
        svg: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 532 436"><path d="M26 74c0-26 22-48 48-48h384c27 0 48 22 48 48v224c0 26-21 47-47 48-45-45-91-91-136-137-32-31-82-31-114 0-45 46-91 91-136 137-26-1-47-22-47-48V74z" class="fill-primary/30"/><path d="M458 26H74c-26 0-48 22-48 48v224c0 26 21 47 47 48l-14 14c-28-7-49-32-49-62V74c0-35 29-64 64-64h384c35 0 64 29 64 64v224c0 30-21 55-49 62l-14-14c26-1 47-22 47-48V74c0-26-21-48-48-48zM138 410h256c7 0 12-4 15-10 2-6 1-13-4-17L277 255c-6-6-16-6-22 0L127 383c-5 4-6 11-4 17 3 6 9 10 15 10zm279-39c9 10 12 23 7 35s-17 20-30 20H138c-13 0-25-8-30-20s-2-25 7-35l128-128c13-12 33-12 46 0l128 128z" class="fill-primary"/></svg>`,
    },
    {
        key: 'Chromecast' as const,
        title: 'Chromecast',
        description: 'Allow casting to Chromecast devices',
        svg: `<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 532 468"><path d="M26 74c0-26 22-48 48-48h384c27 0 48 22 48 48v320c0 27-21 48-48 48H314v-9c0-154-125-279-279-279h-9V74z" class="fill-primary/30"/><path d="M458 26H74c-26 0-48 22-48 48v80H10V74c0-35 29-64 64-64h384c35 0 64 29 64 64v320c0 35-29 64-64 64H314v-16h144c27 0 48-21 48-48V74c0-26-21-48-48-48zM18 202c137 0 248 111 248 248 0 4-4 8-8 8s-8-4-8-8c0-128-104-232-232-232-4 0-8-4-8-8s4-8 8-8zm40 224c0-9-7-16-16-16s-16 7-16 16 7 16 16 16 16-7 16-16zm-48 0c0-18 14-32 32-32s32 14 32 32-14 32-32 32-32-14-32-32zm0-120c0-4 4-8 8-8 84 0 152 68 152 152 0 4-4 8-8 8s-8-4-8-8c0-75-61-136-136-136-4 0-8-4-8-8z" class="fill-primary"/></svg>`,
    },
];
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
                <h2 class="text-base font-semibold text-foreground">Player Settings</h2>
                <p class="text-sm text-foreground/60 mt-0.5">
                    Configure default video player behavior and features.
                </p>
            </div>
            <Button
                label="Save Changes"
                icon="pi pi-check"
                size="small"
                :loading="saving"
                @click="handleSave"
                class="press-animated"
            />
        </div>

        <!-- Content -->
        <div class="divide-y divide-border">
            <div
                v-for="item in settingsItems"
                :key="item.key"
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        :class="`:uno: w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary`"
                    >
                        <span v-html="item.svg" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">{{ item.title }}</p>
                        <p class="text-xs text-foreground/60 mt-0.5">{{ item.description }}</p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings[item.key]" />
            </div>
        </div>
    </div>
</template>
