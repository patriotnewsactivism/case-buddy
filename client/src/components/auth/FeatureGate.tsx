import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  limitType?: string;
  showUpgradePrompt?: boolean;
}

interface UsageGateProps {
  limitType: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  limitType,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const { checkFeatureAccess, subscription } = useAuth();
  const { getUsage } = useUsageTracking();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const access = checkFeatureAccess(feature);
      
      if (limitType && access) {
        const usage = await getUsage(limitType);
        const limit = subscription?.limits?.[limitType] || 0;
        setHasAccess(limit === -1 || usage < limit);
      } else {
        setHasAccess(access);
      }
      
      setIsLoading(false);
    };
    
    checkAccess();
  }, [feature, limitType, subscription, checkFeatureAccess, getUsage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return <UpgradePrompt feature={feature} limitType={limitType} />;
}

export function UsageGate({ limitType, children, fallback }: UsageGateProps) {
  const { subscription } = useAuth();
  const { getUsage } = useUsageTracking();
  const [hasAccess, setHasAccess] = useState(true);
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsage = async () => {
      const currentUsage = await getUsage(limitType);
      const currentLimit = subscription?.limits?.[limitType] || 0;
      
      setUsage(currentUsage);
      setLimit(currentLimit);
      setHasAccess(currentLimit === -1 || currentUsage < currentLimit);
      setIsLoading(false);
    };
    
    checkUsage();
  }, [limitType, subscription, getUsage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="relative">
        {children}
        <UsageIndicator 
          usage={usage} 
          limit={limit} 
          limitType={limitType}
        />
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UsageLimitReached limitType={limitType} usage={usage} limit={limit} />;
}

function UpgradePrompt({ feature, limitType }: { feature?: string; limitType?: string }) {
  const { subscription } = useAuth();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center border border-gray-200">
      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {feature ? `Upgrade for ${feature}` : 'Upgrade Required'}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {limitType 
          ? `You've reached your ${limitType} limit for this billing period.`
          : 'This feature is available in higher tiers.'
        }
      </p>

      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          View Pricing Plans
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        
        {subscription?.tier !== 'free' && (
          <button
            onClick={() => window.location.href = '/billing'}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Manage Subscription
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Current plan: {subscription?.tier || 'Free'}
      </div>
    </div>
  );
}

function UsageIndicator({ usage, limit, limitType }: { 
  usage: number; 
  limit: number; 
  limitType: string;
}) {
  const percentage = limit > 0 ? (usage / limit) * 100 : 0;
  const isHighUsage = percentage >= 80;

  if (limit === -1) return null;

  return (
    <div className="absolute top-2 right-2 bg-white rounded-lg shadow-sm border p-2">
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-600">
          {usage} / {limit} {limitType}
        </div>
        <div className={cn(
          "w-16 h-2 bg-gray-200 rounded-full overflow-hidden",
          isHighUsage && "ring-2 ring-yellow-400"
        )}>
          <div 
            className={cn(
              "h-full transition-all duration-300",
              isHighUsage ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {isHighUsage && (
          <span className="text-xs text-yellow-600 font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}

function UsageLimitReached({ limitType, usage, limit }: { 
  limitType: string; 
  usage: number; 
  limit: number;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-red-100 rounded-full p-3">
          <X className="h-6 w-6 text-red-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        {limitType.charAt(0).toUpperCase() + limitType.slice(1)} Limit Reached
      </h3>
      
      <p className="text-red-700 mb-6">
        You've used {usage} out of {limit} available {limitType} this billing period.
        Your limit will reset on your next billing date.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Upgrade Plan
        </button>
        
        <button
          onClick={() => window.location.href = '/billing'}
          className="w-full bg-white text-red-600 border border-red-300 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
        >
          Manage Usage
        </button>
      </div>
    </div>
  );
}

// Specialized feature gates for common use cases
export function DocumentUploadGate({ children }: { children: React.ReactNode }) {
  return (
    <UsageGate limitType="documents">
      <FeatureGate feature="document_upload">
        {children}
      </FeatureGate>
    </UsageGate>
  );
}

export function AIAnalysisGate({ children }: { children: React.ReactNode }) {
  return (
    <UsageGate limitType="ai_requests">
      <FeatureGate feature="ai_analysis">
        {children}
      </FeatureGate>
    </UsageGate>
  );
}

export function ClientPortalGate({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="client_portal">
      {children}
    </FeatureGate>
  );
}

export function TeamCollaborationGate({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="team_collaboration">
      {children}
    </FeatureGate>
  );
}