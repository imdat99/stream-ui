<template>
  <div class="flex flex-col items-center gap-3 py-6 text-center">
    <div class="i-svg-spinners-90-ring-with-bg h-10 w-10 text-blue-600"></div>
    <p class="text-sm text-gray-600">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAppToast } from '@/composables/useAppToast';
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useAppToast();

const status = computed(() => String(route.query.status ?? 'error'));
const reason = computed(() => String(route.query.reason ?? 'google_login_failed'));

const reasonMessages: Record<string, string> = {
  missing_state: 'Google login session is invalid. Please try again.',
  invalid_state: 'Google login session has expired. Please try again.',
  missing_code: 'Google did not return an authorization code.',
  access_denied: 'Google login was cancelled.',
  exchange_failed: 'Failed to sign in with Google.',
  userinfo_failed: 'Failed to load your Google account information.',
  userinfo_parse_failed: 'Failed to read your Google account information.',
  missing_email: 'Your Google account did not provide an email address.',
  create_user_failed: 'Failed to create your account.',
  update_user_failed: 'Failed to update your account.',
  reload_user_failed: 'Failed to finish signing you in.',
  session_failed: 'Failed to create your sign-in session.',
  fetch_me_failed: 'Signed in with Google, but failed to load your account.',
  google_login_failed: 'Google login failed. Please try again.',
};

const errorMessage = computed(() => reasonMessages[reason.value] ?? reasonMessages.google_login_failed);
const message = computed(() => status.value === 'success' ? 'Signing you in with Google...' : errorMessage.value);

onMounted(async () => {
  if (status.value !== 'success') {
    toast.add({
      severity: 'error',
      summary: 'Google login failed',
      detail: errorMessage.value,
      life: 5000,
    });
    await router.replace({ name: 'login', query: { reason: reason.value } });
    return;
  }

  try {
    const user = await auth.fetchMe();
    if (!user) {
      throw new Error('missing_user');
    }

    await router.replace({ name: 'overview' });
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Google login failed',
      detail: 'Signed in with Google, but failed to load your account.',
      life: 5000,
    });
    await router.replace({ name: 'login', query: { reason: 'fetch_me_failed' } });
  }
});
</script>
