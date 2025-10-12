import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, X, Zap } from 'lucide-react';
import { useSubscription } from '@/lib/subscription';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  limitType?: string;
  showUpgradePrompt?: boolean;
  className?: string;
}

interface UsageGateProps {
  limitType: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  limitType,
  showUpgradePrompt = true,
  className
}: FeatureGateProps) {
  const { canAccessFeature, checkUsageLimit, tier } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        const access = await canAccessFeature(feature);
        
        if (limitType && access) {
          const usage = await checkUsageLimit(limitType);
          setUsageInfo(usage);
          setHasAccess(usage.allowed);
        } else {
          setHasAccess(access);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      }
      
      setIsLoading(false);
    };
    
    checkAccess();
  }, [feature, limitType, canAccessFeature, checkUsageLimit]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className={className}>
        {children}
        {usageInfo && limitType && (
          <UsageIndicator 
            usage={usageInfo.current} 
            limit={usageInfo.limit} 
            limitType={limitType}
          />
        )}
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return <UpgradePrompt feature={feature} limitType={limitType} />;
}

export function UsageGate({ limitType, children, fallback, className }: UsageGateProps) {
  const { checkUsageLimit, tier } = useSubscription();
  const [hasAccess, setHasAccess] = useState(true);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsage = async () => {
      setIsLoading(true);
      
      try {
        const usage = await checkUsageLimit(limitType);
        setUsageInfo(usage);
        setHasAccess(usage.allowed);
      } catch (error) {
        console.error('Error checking usage:', error);
        setHasAccess(false);
      }
      
      setIsLoading(false);
    };
    
    checkUsage();
  }, [limitType, checkUsageLimit]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className={className}>
        {children}
        {usageInfo && (
          <UsageIndicator 
            usage={usageInfo.current} 
            limit={usageInfo.limit} 
            limitType={limitType}
          />
        )}
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UsageLimitReached limitType={limitType} usage={usageInfo} />;
}

function UpgradePrompt({ feature, limitType }: { feature?: string; limitType?: string }) {
  const { tier } = useSubscription();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 text-center border border-blue-200">
      <div className="flex justify-center mb-4">
        <div className="bg-blue-100 rounded-full p-4">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
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
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          View Pricing Plans
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        
        {tier !== 'free' && (
          <button
            onClick={() => window.location.href = '/billing'}
            className="w-full bg-white text-blue-600 border border-blue-300 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Manage Subscription
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Current plan: {tier.charAt(0).toUpperCase() + tier.slice(1).replace('_', ' ')}
      </div>
    </div>
  );
}

function UsageIndicator({ usage, limit, limitType }: { 
  usage: number; 
  limit: number; 
  limitType: string;
}) {
  if (limit === -1) return null;

  const percentage = limit > 0 ? (usage / limit) * 100 : 0;
  const isHighUsage = percentage >= 80;
  const isCritical = percentage >= 90;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 capitalize">{limitType}</span>
        <span className={`text-sm font-medium ${isCritical ? 'text-red-600' : isHighUsage ? 'text-yellow-600' : 'text-green-600'}`}>
          {usage} / {limit} used
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            isCritical ? "bg-red-500" : isHighUsage ? "bg-yellow-500" : "bg-green-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {(isHighUsage || isCritical) && (
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
            {isCritical ? 'Critical: ' : 'Warning: '} Approaching limit
          </span>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
}

function UsageLimitReached({ limitType, usage }: { 
  limitType: string; 
  usage: any;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-red-100 rounded-full p-3">
          <X className="h-6 w-6 text-red-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-red-900 mb-2">
        {limitType.charAt(0).toUpperCase() + limitType.slice(1)} Limit Reached
      </h3>
      
      <p className="text-red-700 mb-6">
        You've used {usage?.current || 0} out of {usage?.limit || 0} available {limitType} this billing period.
        Your limit will reset on your next billing date.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Upgrade Plan
        </button>
        
        <button
          onClick={() => window.location.href = '/billing'}
          className="w-full bg-white text-red-600 border border-red-300 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          Manage Usage
        </button>
      </div>
    </div>
  );
}

// Specialized feature gates
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

export function AdvancedAnalyticsGate({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="advanced_analytics">
      {children}
    </FeatureGate>
  );
}

export function APIAccessGate({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="api_access">
      {children}
    </FeatureGate>
  );
}