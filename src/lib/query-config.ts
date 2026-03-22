export const queryConfig = {
  decisions: { staleTime: 2 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  ministries: { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000 },
  notifications: { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 },
  stats: { staleTime: 5 * 60 * 1000, gcTime: 15 * 60 * 1000 },
  publicDecisions: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000 },
};
