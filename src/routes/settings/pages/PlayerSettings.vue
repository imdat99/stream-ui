<script setup lang="ts">
import { ref } from 'vue';
import PlayIcon from '@/components/icons/PlayIcon.vue';
import RepeatIcon from '@/components/icons/RepeatIcon.vue';
import VolumeOffIcon from '@/components/icons/VolumeOffIcon.vue';
import SlidersIcon from '@/components/icons/SlidersIcon.vue';
import ImageIcon from '@/components/icons/ImageIcon.vue';
import WifiIcon from '@/components/icons/WifiIcon.vue';
import MonitorIcon from '@/components/icons/MonitorIcon.vue';

const playerSettings = ref({
    autoplay: true,
    loop: false,
    muted: false,
    showControls: true,
    pip: true,
    airplay: true,
    Chromecast: false,
});

defineEmits<{
    save: [];
}>();
</script>

<template>
    <div class="bg-surface border border-border rounded-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
            <h2 class="text-base font-semibold text-foreground">Player Settings</h2>
            <p class="text-sm text-foreground/60 mt-0.5">
                Configure default video player behavior and features.
            </p>
        </div>

        <!-- Content -->
        <div class="divide-y divide-border">
            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
                    >
                        <PlayIcon class="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Autoplay</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Automatically start videos when loaded
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.autoplay" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0"
                    >
                        <RepeatIcon class="text-accent w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Loop</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Repeat video when it ends
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.loop" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0"
                    >
                        <VolumeOffIcon class="text-info w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Muted</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Start videos with sound muted
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.muted" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-success/10 flex items-center justify-center shrink-0"
                    >
                        <SlidersIcon class="text-success w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Show Controls</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Display player controls (play, pause, volume)
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.showControls" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center shrink-0"
                    >
                        <ImageIcon class="text-warning w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Picture in Picture</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Enable Picture-in-Picture mode
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.pip" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-secondary/10 flex items-center justify-center shrink-0"
                    >
                        <WifiIcon class="text-secondary w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">AirPlay</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Allow streaming to Apple devices via AirPlay
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.airplay" />
            </div>

            <div
                class="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-all"
            >
                <div class="flex items-center gap-4">
                    <div
                        class=":uno: w-10 h-10 rounded-md bg-info/10 flex items-center justify-center shrink-0"
                    >
                        <MonitorIcon class="text-info w-5 h-5" />
                    </div>
                    <div>
                        <p class="text-sm font-medium text-foreground">Chromecast</p>
                        <p class="text-xs text-foreground/60 mt-0.5">
                            Allow casting to Chromecast devices
                        </p>
                    </div>
                </div>
                <ToggleSwitch v-model="playerSettings.Chromecast" />
            </div>
        </div>
    </div>
</template>
