<script setup lang="ts">
import type { PlayerConfig } from '../types';
import { computed } from 'vue';
import { useTranslation } from 'i18next-vue';

const props = defineProps<{
    config: PlayerConfig;
}>();

const { t } = useTranslation();

const badges = computed(() => {
    const values: Array<{ label: string; color: string }> = [];

    if (props.config.autoplay) values.push({ label: t('settings.playerConfigs.badges.autoplay'), color: 'bg-blue-500/10 text-blue-500' });
    if (props.config.loop) values.push({ label: t('settings.playerConfigs.badges.loop'), color: 'bg-green-500/10 text-green-500' });
    if (props.config.muted) values.push({ label: t('settings.playerConfigs.badges.muted'), color: 'bg-yellow-500/10 text-yellow-500' });
    if (props.config.showControls) values.push({ label: t('settings.playerConfigs.badges.controls'), color: 'bg-purple-500/10 text-purple-500' });
    if (props.config.pip) values.push({ label: t('settings.playerConfigs.badges.pip'), color: 'bg-pink-500/10 text-pink-500' });
    if (props.config.airplay) values.push({ label: t('settings.playerConfigs.badges.airplay'), color: 'bg-indigo-500/10 text-indigo-500' });
    if (props.config.chromecast) values.push({ label: t('settings.playerConfigs.badges.chromecast'), color: 'bg-red-500/10 text-red-500' });
    if (props.config.encrytionM3u8) values.push({ label: t('settings.playerConfigs.badges.encrytionM3u8'), color: 'bg-amber-500/10 text-amber-500' });
    if (props.config.logoUrl) values.push({ label: t('settings.playerConfigs.badges.logo'), color: 'bg-sky-500/10 text-sky-500' });

    return values;
});
</script>

<template>
    <div class="flex max-w-[280px] flex-wrap gap-1">
        <span
            v-for="badge in badges.slice(0, 4)"
            :key="badge.label"
            :class="['rounded px-1.5 py-0.5 text-xs font-medium', badge.color]"
        >
            {{ badge.label }}
        </span>
        <span v-if="badges.length > 4" class="text-xs text-foreground/50">+{{ badges.length - 4 }}</span>
    </div>
</template>
