import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Subscription tier types
export type SubscriptionTier = 'free' | 'pro_se' | 'attorney' | 'law_firm' | 'enterprise';

export interface SubscriptionLimits {
  documents: number;
  ai_requests: number;
  team_members: number;
  storage_gb: number;
}

export interface SubscriptionTierDetails {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: SubscriptionLimits;
  description: string;
  popular: boolean;
}

// Get subscription tier details
export async function getSubscriptionTier(tier: string): Promise<SubscriptionTierDetails | null> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('id', tier)
    .single();
  
  if (error) {
    console.error('Error getting subscription tier:', error);
    return null;
  }
  
  return data;
}

// Get current user's subscription
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, trial_end_date')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
  
  return data;
}

// Check if user has access to a feature
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_access_feature', {
    user_uuid: userId,
    feature_name: feature
  });
  
  if (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
  
  return data;
}

// Check usage limits
export async function checkUsageLimit(
  userId: string, 
  feature: string, 
  requested: number = 1
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const { data, error } = await supabase.rpc('check_usage_limit', {
    user_uuid: userId,
    feature_name: feature,
    requested_amount: requested
  });
  
  if (error) {
    console.error('Error checking usage limit:', error);
    return { allowed: false, current: 0, limit: 0, remaining: 0 };
  }
  
  return data;
}

// Track usage
export async function trackUsage(
  userId: string, 
  feature: string, 
  increment: number = 1,
  metadata?: Record<string, any>
): Promise<{
  success: boolean;
  count: number;
  limit: number;
  remaining: number;
}> {
  const response = await fetch('/.netlify/functions/track-usage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`
    },
    body: JSON.stringify({
      feature,
      increment,
      metadata
    })
  });

  const result = await response.json();
  return result;
}

// Get usage data
export async function getUsage(
  userId: string, 
  feature?: string
): Promise<any> {
  const params = new URLSearchParams();
  if (feature) params.append('feature', feature);

  const response = await fetch(
    `/.netlify/functions/get-usage?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${userId}`
      }
    }
  );

  const result = await response.json();
  return result;
}

// Get all subscription tiers
export async function getAllTiers(): Promise<SubscriptionTierDetails[]> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('price_monthly');
  
  if (error) {
    console.error('Error getting all tiers:', error);
    return [];
  }
  
  return data || [];
}

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  tier: string,
  billingCycle: 'monthly' | 'annual',
  email: string
): Promise<string | null> {
  const response = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tier,
      billingCycle,
      userId,
      email
    })
  });

  const result = await response.json();
  return result.sessionId || null;
}

// Create customer portal session
export async function createPortalSession(userId: string): Promise<string | null> {
  const response = await fetch('/.netlify/functions/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });

  const result = await response.json();
  return result.url || null;
}

// Hook for subscription context
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  status: string;
  limits: SubscriptionLimits;
  features: string[];
  trialEndDate?: Date;
  canAccessFeature: (feature: string) => Promise<boolean>;
  checkUsageLimit: (feature: string, requested?: number) => Promise<any>;
  trackUsage: (feature: string, increment?: number, metadata?: any) => Promise<any>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionContextType>({
    tier: 'free',
    status: 'inactive',
    limits: { documents: 3, ai_requests: 5, team_members: 1, storage_gb: 1 },
    features: ['Basic case management', '3 documents per month', 'Community support', 'Basic timeline'],
    loading: true,
    canAccessFeature: async () => false,
    checkUsageLimit: async () => ({ allowed: false, current: 0, limit: 0, remaining: 0 }),
    trackUsage: async () => ({ success: false, count: 0, limit: 0, remaining: 0 })
  });

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const [userSub, tierDetails] = await Promise.all([
        getUserSubscription(user.id),
        getSubscriptionTier(user.subscription_tier || 'free')
      ]);

      if (userSub && tierDetails) {
        setSubscription({
          tier: userSub.subscription_tier as SubscriptionTier,
          status: userSub.subscription_status,
          limits: tierDetails.limits,
          features: tierDetails.features,
          trialEndDate: userSub.trial_end_date ? new Date(userSub.trial_end_date) : undefined,
          canAccessFeature: (feature) => hasFeatureAccess(user.id, feature),
          checkUsageLimit: (feature, requested) => checkUsageLimit(user.id, feature, requested),
          trackUsage: (feature, increment, metadata) => trackUsage(user.id, feature, increment, metadata),
          loading: false
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}