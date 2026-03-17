import { inject, onBeforeUnmount, reactive, watchEffect, type VNode } from 'vue';

export type AdminHeaderAction = {
  label: string;
  icon?: string | VNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export type AdminPageHeaderState = {
  eyebrow?: string;
  badge?: string;
  actions: AdminHeaderAction[];
  owner: symbol | null;
};

export const adminPageHeaderKey = Symbol('admin-page-header');

export const createAdminPageHeaderState = (): AdminPageHeaderState => reactive({
  eyebrow: undefined,
  badge: undefined,
  actions: [],
  owner: null,
});

export const useAdminPageHeader = (getConfig: () => Omit<AdminPageHeaderState, 'owner'>) => {
  const state = inject<AdminPageHeaderState | null>(adminPageHeaderKey, null);

  if (!state) {
    return;
  }

  const owner = Symbol('admin-page-header-owner');

  watchEffect(() => {
    const config = getConfig();
    state.owner = owner;
    state.eyebrow = config.eyebrow;
    state.badge = config.badge;
    state.actions = config.actions;
  });

  onBeforeUnmount(() => {
    if (state.owner !== owner) return;
    state.owner = null;
    state.eyebrow = undefined;
    state.badge = undefined;
    state.actions = [];
  });
};
