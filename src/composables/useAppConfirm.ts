import { computed, reactive, readonly } from 'vue';
import { getActiveI18n } from '@/i18n';

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
  const i18n = getActiveI18n();
  const defaultHeader = i18n?.t('confirm.defaultHeader') ?? 'Confirm';
  const defaultAccept = i18n?.t('confirm.defaultAccept') ?? 'OK';
  const defaultReject = i18n?.t('confirm.defaultReject') ?? 'Cancel';

  state.visible = true;
  state.loading = false;
  state.message = options.message;
  state.header = options.header ?? defaultHeader;
  state.acceptLabel = options.acceptLabel ?? defaultAccept;
  state.rejectLabel = options.rejectLabel ?? defaultReject;
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
