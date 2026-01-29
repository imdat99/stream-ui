<script setup lang="ts">
import { cn } from '@/lib/utils';
import { type Component, VNode } from 'vue';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface Action {
  label: string;
  icon?: string | VNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

interface Props {
  title: string | VNode | Component;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: Action[];
}

const props = defineProps<Props>();

const getButtonClass = (variant?: string) => {
  const baseClass = 'px-4 py-2.5 rounded-lg font-medium transition-all press-animated flex items-center gap-2';

  switch (variant) {
    case 'primary':
      return `${baseClass} bg-primary hover:bg-primary-600 text-white shadow-sm`;
    case 'danger':
      return `${baseClass} bg-danger hover:bg-danger-600 text-white shadow-sm`;
    case 'secondary':
    default:
      return `${baseClass} bg-white hover:bg-gray-50 text-gray-700 border border-gray-300`;
  }
};
</script>

<template>
  <div :class="cn('page-header mb-6')">
    <!-- Breadcrumb -->
    <nav v-if="breadcrumbs && breadcrumbs.length" class="flex items-center gap-2 text-sm mb-2">
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <router-link v-if="crumb.to" :to="crumb.to" class="text-gray-500 hover:text-primary transition-colors">
          {{ crumb.label }}
        </router-link>
        <span v-else class="text-gray-700 font-medium">{{ crumb.label }}</span>

        <span v-if="index < breadcrumbs.length - 1" class="w-4 h-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </template>
    </nav>

    <!-- Title & Actions -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex-1 min-w-0">
        <h1 v-if="typeof props.title == 'string'" class="text-3xl font-bold text-gray-900 mb-1">{{ title }}</h1>
        <component v-else :is="title" />
        <p v-if="description" class="text-gray-600">{{ description }}</p>
      </div>

      <div v-if="actions && actions.length" class="flex items-center gap-2 flex-shrink-0">
        <button v-for="(action, index) in actions" :key="index" @click="action.onClick"
          :class="getButtonClass(action.variant)">
          <component v-if="action.icon" :is="action.icon" class="w-5 h-5" />
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>
