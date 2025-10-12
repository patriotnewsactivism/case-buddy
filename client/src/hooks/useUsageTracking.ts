import { useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';

interface UsageData {
  feature: string;
  count: number;
  date: string;
}

interface UsageLimits {
  documents: number;
  ai_requests: number;
  team_members: number;
  storage_gb: number;
}

interface UsageStats {
  current: UsageData[];
  limits: UsageLimits;
  period: {
    start: string;
    end: string;
  };
}

export function useUsageTracking() {
  const { user } = useAuth();

  const trackUsage = useCallback(async (
    feature: string, 
    increment: number = 1,
    metadata?: Record<string, any>
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const response = await fetch('/.netlify/functions/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          feature,
          increment,
          metadata
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error tracking usage:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  const getUsage = useCallback(async (feature?: string): Promise<UsageStats | number> => {
    if (!user) return feature ? 0 : { current: [], limits: {}, period: { start: '', end: '' } };

    try {
      const response = await fetch(
        `/.netlify/functions/get-usage${feature ? `?feature=${feature}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        }
      );

      const result = await response.json();
      return feature ? result.count : result;
    } catch (error) {
      console.error('Error getting usage:', error);
      return feature ? 0 : { current: [], limits: {}, period: { start: '', end: '' } };
    }
  }, [user]);

  const getUsageHistory = useCallback(async (
    feature?: string,
    startDate?: string,
    endDate?: string
  ): Promise<UsageData[]> => {
    if (!user) return [];

    try {
      const params = new URLSearchParams();
      if (feature) params.append('feature', feature);
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const response = await fetch(
        `/.netlify/functions/get-usage-history?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        }
      );

      const result = await response.json();
      return result.history || [];
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }, [user]);

  const checkLimit = useCallback(async (
    feature: string,
    requested: number = 1
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
  }> => {
    if (!user) return { allowed: false, current: 0, limit: 0, remaining: 0 };

    try {
      const response = await fetch('/.netlify/functions/check-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          feature,
          requested
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking limit:', error);
      return { allowed: false, current: 0, limit: 0, remaining: 0 };
    }
  }, [user]);

  const getUsageAlerts = useCallback(async (): Promise<{
    alerts: Array<{
      feature: string;
      current: number;
      limit: number;
      percentage: number;
      severity: 'warning' | 'critical';
    }>;
    recommendations: string[];
  }> => {
    if (!user) return { alerts: [], recommendations: [] };

    try {
      const response = await fetch('/.netlify/functions/get-usage-alerts', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting usage alerts:', error);
      return { alerts: [], recommendations: [] };
    }
  }, [user]);

  const resetUsage = useCallback(async (feature?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/.netlify/functions/reset-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({ feature })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error resetting usage:', error);
      return false;
    }
  }, [user]);

  // Specialized tracking functions for common features
  const trackDocumentUpload = useCallback(async (documentType: string, fileSize: number) => {
    return trackUsage('documents', 1, {
      type: documentType,
      size: fileSize
    });
  }, [trackUsage]);

  const trackAIRequest = useCallback(async (aiType: string, tokens: number) => {
    return trackUsage('ai_requests', 1, {
      type: aiType,
      tokens
    });
  }, [trackUsage]);

  const trackTeamMember = useCallback(async (action: 'added' | 'removed') => {
    return trackUsage('team_members', action === 'added' ? 1 : -1);
  }, [trackUsage]);

  const trackStorage = useCallback(async (bytes: number) => {
    return trackUsage('storage_gb', Math.ceil(bytes / (1024 * 1024 * 1024)));
  }, [trackUsage]);

  return {
    trackUsage,
    getUsage,
    getUsageHistory,
    checkLimit,
    getUsageAlerts,
    resetUsage,
    
    // Specialized functions
    trackDocumentUpload,
    trackAIRequest,
    trackTeamMember,
    trackStorage
  };
}

// Usage tracking context for React components
import { createContext, useContext } from 'react';

const UsageTrackingContext = createContext<ReturnType<typeof useUsageTracking> | null>(null);

export function UsageTrackingProvider({ children }: { children: React.ReactNode }) {
  const usageTracking = useUsageTracking();
  
  return (
    <UsageTrackingContext.Provider value={usageTracking}>
      {children}
    </UsageTrackingContext.Provider>
  );
}

export function useUsageTrackingContext() {
  const context = useContext(UsageTrackingContext);
  if (!context) {
    throw new Error('useUsageTrackingContext must be used within UsageTrackingProvider');
  }
  return context;
}