import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionStatus {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
}

export function useSubscription() {
  const { data: subscriptionStatus, isLoading, error } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    retry: false,
  });

  return {
    subscriptionStatus,
    isLoading,
    error,
    hasActiveSubscription: subscriptionStatus?.isSubscriptionActive || false,
    isTrialActive: subscriptionStatus?.isTrialActive || false,
    trialEndsAt: subscriptionStatus?.trialEndsAt ? new Date(subscriptionStatus.trialEndsAt) : null,
    daysRemainingInTrial: subscriptionStatus?.trialEndsAt 
      ? Math.max(0, Math.ceil((new Date(subscriptionStatus.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0,
  };
}