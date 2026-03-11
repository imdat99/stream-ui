import { client, type PreferencesSettingsPreferencesRequest } from '@/api/client';
import { useQuery } from '@pinia/colada';

export const SETTINGS_PREFERENCES_QUERY_KEY = ['settings', 'preferences'] as const;

export type SettingsPreferencesSnapshot = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingNotifications: boolean;
  telegramNotifications: boolean;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  pip: boolean;
  airplay: boolean;
  chromecast: boolean;
};

export type NotificationSettingsDraft = {
  email: boolean;
  push: boolean;
  marketing: boolean;
  telegram: boolean;
};

export type PlayerSettingsDraft = {
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  pip: boolean;
  airplay: boolean;
  chromecast: boolean;
  encrytion_m3u8: boolean;
};

type PreferencesResponse = {
  data?: {
    preferences?: PreferencesSettingsPreferencesRequest;
  };
};

const DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT: SettingsPreferencesSnapshot = {
  emailNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
  telegramNotifications: false,
  autoplay: false,
  loop: false,
  muted: false,
  showControls: true,
  pip: true,
  airplay: true,
  chromecast: true,
};

const normalizePreferencesSnapshot = (responseData: unknown): SettingsPreferencesSnapshot => {
  const preferences = (responseData as PreferencesResponse | undefined)?.data?.preferences;

  return {
    emailNotifications: preferences?.email_notifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.emailNotifications,
    pushNotifications: preferences?.push_notifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.pushNotifications,
    marketingNotifications: preferences?.marketing_notifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.marketingNotifications,
    telegramNotifications: preferences?.telegram_notifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.telegramNotifications,
    autoplay: preferences?.autoplay ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.autoplay,
    loop: preferences?.loop ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.loop,
    muted: preferences?.muted ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.muted,
    showControls: preferences?.show_controls ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.showControls,
    pip: preferences?.pip ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.pip,
    airplay: preferences?.airplay ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.airplay,
    chromecast: preferences?.chromecast ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.chromecast,
  };
};

export const createNotificationSettingsDraft = (
  snapshot: SettingsPreferencesSnapshot = DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT,
): NotificationSettingsDraft => ({
  email: snapshot.emailNotifications,
  push: snapshot.pushNotifications,
  marketing: snapshot.marketingNotifications,
  telegram: snapshot.telegramNotifications,
});

export const createPlayerSettingsDraft = (
  snapshot: SettingsPreferencesSnapshot = DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT,
): PlayerSettingsDraft => ({
  autoplay: snapshot.autoplay,
  loop: snapshot.loop,
  muted: snapshot.muted,
  showControls: snapshot.showControls,
  pip: snapshot.pip,
  airplay: snapshot.airplay,
  chromecast: snapshot.chromecast,
  encrytion_m3u8: snapshot.chromecast
});

export const toNotificationPreferencesPayload = (
  draft: NotificationSettingsDraft,
): PreferencesSettingsPreferencesRequest => ({
  email_notifications: draft.email,
  push_notifications: draft.push,
  marketing_notifications: draft.marketing,
  telegram_notifications: draft.telegram,
});

export const toPlayerPreferencesPayload = (
  draft: PlayerSettingsDraft,
): PreferencesSettingsPreferencesRequest => ({
  autoplay: draft.autoplay,
  loop: draft.loop,
  muted: draft.muted,
  show_controls: draft.showControls,
  pip: draft.pip,
  airplay: draft.airplay,
  chromecast: draft.chromecast,
});

export function useSettingsPreferencesQuery() {
  return useQuery({
    key: () => SETTINGS_PREFERENCES_QUERY_KEY,
    query: async () => {
      const response = await client.settings.preferencesList({ baseUrl: '/r' });
      return normalizePreferencesSnapshot(response.data);
    },
  });
}
