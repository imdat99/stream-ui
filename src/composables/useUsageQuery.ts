import { client } from '@/api/client';
import { useQuery } from '@pinia/colada';

export const USAGE_QUERY_KEY = ['usage'] as const;

export type UsageSnapshot = {
  totalVideos: number;
  totalStorage: number;
};

type UsageResponse = {
  data?: {
    total_videos?: number;
    total_storage?: number;
  };
};

const DEFAULT_USAGE_SNAPSHOT: UsageSnapshot = {
  totalVideos: 0,
  totalStorage: 0,
};

const normalizeUsageSnapshot = (responseData: unknown): UsageSnapshot => {
  const usage = (responseData as UsageResponse | undefined)?.data;

  return {
    totalVideos: usage?.total_videos ?? DEFAULT_USAGE_SNAPSHOT.totalVideos,
    totalStorage: usage?.total_storage ?? DEFAULT_USAGE_SNAPSHOT.totalStorage,
  };
};

export function useUsageQuery() {
  return useQuery({
    key: () => USAGE_QUERY_KEY,
    query: async () => {
      const response = await client.usage.usageList({ baseUrl: '/r' });
      return normalizeUsageSnapshot(response.data);
    },
  });
}
