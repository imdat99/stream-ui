import { computed, reactive, readonly } from 'vue';

export type AppConfirmOptions = {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void | Promise<void>;
  reject?: () => void;
};

type AppConfirmState = {
  visible: boolean;
  loading: boolean;
  message: string;
  header: string;
  acceptLabel: string;
  rejectLabel: string;
  accept?: () => void | Promise<void>;
  reject?: () => void;
};

const state = reactive<AppConfirmState>({
  visible: false,
  loading: false,
  message: '',
  header: 'Confirm',
  acceptLabel: 'OK',
  rejectLabel: 'Cancel',
});

const requireConfirm = (options: AppConfirmOptions) => {
  state.visible = true;
  state.loading = false;
  state.message = options.message;
  state.header = options.header ?? 'Confirm';
  state.acceptLabel = options.acceptLabel ?? 'OK';
  state.rejectLabel = options.rejectLabel ?? 'Cancel';
  state.accept = options.accept;
  state.reject = options.reject;
};

const close = () => {
  state.visible = false;
  state.loading = false;
  state.message = '';
  state.accept = undefined;
  state.reject = undefined;
};

const onReject = () => {
  try {
    state.reject?.();
  } finally {
    close();
  }
};

const onAccept = async () => {
  state.loading = true;
  try {
    await state.accept?.();
    close();
  } catch (e) {
    // Keep dialog open on error; caller can show a toast.
    throw e;
  } finally {
    state.loading = false;
  }
};

export const useAppConfirm = () => {
  return {
    require: requireConfirm,
    close,
    accept: onAccept,
    reject: onReject,
    visible: computed(() => state.visible),
    loading: computed(() => state.loading),
    message: computed(() => state.message),
    header: computed(() => state.header),
    acceptLabel: computed(() => state.acceptLabel),
    rejectLabel: computed(() => state.rejectLabel),
    _state: readonly(state),
  };
};
