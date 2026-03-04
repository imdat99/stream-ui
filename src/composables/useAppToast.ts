import { computed, reactive, readonly } from 'vue';

export type AppToastSeverity = 'success' | 'info' | 'warn' | 'warning' | 'error' | 'danger';

export type AppToastInput = {
  severity?: AppToastSeverity;
  summary?: string;
  detail?: string;
  life?: number; // ms
};

export type AppToast = {
  id: string;
  severity: AppToastSeverity;
  summary: string;
  detail?: string;
  createdAt: number;
  life: number;
};

const state = reactive<{ toasts: AppToast[] }>({
  toasts: [],
});

const normalizeSeverity = (severity?: AppToastSeverity): AppToastSeverity => {
  if (!severity) return 'info';
  if (severity === 'warning') return 'warn';
  if (severity === 'danger') return 'error';
  return severity;
};

const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const add = (input: AppToastInput) => {
  const toast: AppToast = {
    id: genId(),
    severity: normalizeSeverity(input.severity),
    summary: input.summary ?? '',
    detail: input.detail,
    createdAt: Date.now(),
    life: typeof input.life === 'number' ? input.life : 3000,
  };
  state.toasts.push(toast);
  return toast.id;
};

const remove = (id: string) => {
  const idx = state.toasts.findIndex(t => t.id === id);
  if (idx !== -1) state.toasts.splice(idx, 1);
};

const clear = () => {
  state.toasts.splice(0, state.toasts.length);
};

export const useAppToast = () => {
  return {
    add,
    remove,
    clear,
    toasts: computed(() => state.toasts),
    _state: readonly(state),
  };
};
