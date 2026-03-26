import { client as rpcClient } from '@/api/rpcclient';
import type { Preferences } from '@/server/api/proto/app/v1/common';
import type { UpdatePreferencesRequest } from '@/server/api/proto/app/v1/account';
import { useQuery } from '@pinia/colada';

export const SETTINGS_PREFERENCES_QUERY_KEY = ['settings', 'preferences'] as const;

export type SettingsPreferencesSnapshot = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingNotifications: boolean;
  telegramNotifications: boolean;
  language: string;
  locale: string;
};

export type NotificationSettingsDraft = {
  email: boolean;
  push: boolean;
  marketing: boolean;
  telegram: boolean;
};

type PreferencesResponse = {
  preferences?: Preferences;
};

const DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT: SettingsPreferencesSnapshot = {
  emailNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
  telegramNotifications: false,
  language: 'en',
  locale: 'en',
};

const normalizePreferencesSnapshot = (responseData: unknown): SettingsPreferencesSnapshot => {
  const preferences = (responseData as PreferencesResponse | undefined)?.preferences;

  return {
    emailNotifications: preferences?.emailNotifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.emailNotifications,
    pushNotifications: preferences?.pushNotifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.pushNotifications,
    marketingNotifications: preferences?.marketingNotifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.marketingNotifications,
    telegramNotifications: preferences?.telegramNotifications ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.telegramNotifications,
    language: preferences?.language ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.language,
    locale: preferences?.locale ?? DEFAULT_SETTINGS_PREFERENCES_SNAPSHOT.locale,
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

export const toNotificationPreferencesPayload = (
  draft: NotificationSettingsDraft,
): UpdatePreferencesRequest => ({
  emailNotifications: draft.email,
  pushNotifications: draft.push,
  marketingNotifications: draft.marketing,
  telegramNotifications: draft.telegram,
});

export function useSettingsPreferencesQuery() {
  return useQuery({
    key: () => SETTINGS_PREFERENCES_QUERY_KEY,
    query: async () => {
      const response = await rpcClient.getPreferences();
      return normalizePreferencesSnapshot(response);
    },
  });
}
