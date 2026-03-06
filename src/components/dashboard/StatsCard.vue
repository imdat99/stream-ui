<script setup lang="ts">
import { useTranslation } from 'i18next-vue';
import { VNode } from 'vue';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface Props {
  title: string;
  value: string | number;
  icon?: string | VNode;
  trend?: Trend;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

withDefaults(defineProps<Props>(), {
  color: 'primary'
});

const { t } = useTranslation();

// const gradients = {
//   primary: 'from-primary/20 to-primary/5',
//   success: 'from-success/20 to-success/5',
//   warning: 'from-yellow-100 to-yellow-50',
//   danger: 'from-danger/20 to-danger/5',
//   info: 'from-info/20 to-info/5',
// };

const iconColors = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-yellow-600',
  danger: 'text-danger',
  info: 'text-info',
};
</script>

<template>
  <div :class="[
    'transform translate-y-0 relative overflow-hidden rounded-2xl p-6 bg-surface',
    // gradients[color],
    'border border-gray-300 transition-all duration-300',
    // 'group cursor-pointer'
  ]">
    <!-- Content -->
    <div class="relative z-10">
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
          <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
        </div>

        <div v-if="icon" :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'bg-white/80 shadow-sm',
          iconColors[color]
        ]">
          <component :is="icon" class="w-6 h-6" />
        </div>
      </div>

      <!-- Trend Indicator -->
      <div v-if="trend" class="flex items-center gap-1 text-sm">
        <span :class="[
          'flex items-center gap-1 font-medium',
          trend.isPositive ? 'text-success' : 'text-danger'
        ]">
          <!-- <span :class="[
            'w-4 h-4',
            trend.isPositive ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'
          ]" /> -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="trend.isPositive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 17l6-6 4 4 8-8" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7l-6 6-4-4-8 8" />
          </svg>
          {{ Math.abs(trend.value) }}%
        </span>
        <span class="text-gray-500">{{ t('overview.stats.trendVsLastMonth') }}</span>
      </div>
    </div>
  </div>
</template>
