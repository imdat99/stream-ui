import { client as rpcClient } from '@/api/rpcclient';
import { useQuery } from '@pinia/colada';

export const USAGE_QUERY_KEY = ['usage'] as const;

export type UsageSnapshot = {
  totalVideos: number;
  totalStorage: number;
};

type UsageResponse = {
  totalVideos?: number;
  totalStorage?: number;
};

const DEFAULT_USAGE_SNAPSHOT: UsageSnapshot = {
  totalVideos: 0,
  totalStorage: 0,
};

const normalizeUsageSnapshot = (responseData: unknown): UsageSnapshot => {
  const usage = responseData as UsageResponse | undefined;

  return {
    totalVideos: usage?.totalVideos ?? DEFAULT_USAGE_SNAPSHOT.totalVideos,
    totalStorage: usage?.totalStorage ?? DEFAULT_USAGE_SNAPSHOT.totalStorage,
  };
};

export function useUsageQuery() {
  return useQuery({
    key: () => USAGE_QUERY_KEY,
    query: async () => {
      const response = await rpcClient.getUsage();
      return normalizeUsageSnapshot(response);
    },
  });
}
