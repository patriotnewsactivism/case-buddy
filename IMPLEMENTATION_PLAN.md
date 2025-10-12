# CaseBuddy Monetization Implementation Plan

## Phase 1: Core Infrastructure (Weeks 1-2)

### 1.1 Payment Integration Setup
```bash
# Install required packages
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install @supabase/supabase-js
npm install react-stripe-js
```

### 1.2 Database Schema Updates
```sql
-- Users table with subscription info
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    trial_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription tiers
CREATE TABLE subscription_tiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly INTEGER,
    price_annual INTEGER,
    features JSONB,
    limits JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    feature_name VARCHAR(100),
    usage_count INTEGER DEFAULT 1,
    usage_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Billing history
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    stripe_invoice_id VARCHAR(255),
    amount INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50),
    billing_period_start DATE,
    billing_period_end DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Stripe Configuration
```javascript
// stripe.config.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const subscriptionTiers = {
  free: {
    price_id: null,
    features: ['basic_case_management', '3_documents', 'community_support'],
    limits: { documents: 3, cases: 1, ai_requests: 5 }
  },
  pro_se: {
    price_id: 'price_pro_se_monthly',
    annual_price_id: 'price_pro_se_annual',
    price: 4900, // $49/month
    features: ['unlimited_cases', '50_documents', 'ai_analysis', 'deadline_tracking'],
    limits: { documents: 50, ai_requests: 100 }
  },
  attorney: {
    price_id: 'price_attorney_monthly',
    annual_price_id: 'price_attorney_annual',
    price: 14900, // $149/month
    features: ['unlimited_documents', 'client_portal', 'time_tracking', 'priority_support'],
    limits: { documents: -1, ai_requests: 500 }
  },
  firm: {
    price_id: 'price_firm_monthly',
    annual_price_id: 'price_firm_annual',
    price: 39900, // $399/month
    features: ['team_collaboration', '5_users', 'advanced_analytics', 'custom_branding'],
    limits: { documents: -1, ai_requests: 2000, users: 5 }
  }
};
```

## Phase 2: User Management & Authentication (Weeks 2-3)

### 2.1 Enhanced Auth System
```javascript
// auth-context.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchSubscription(session.user.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchSubscription(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchSubscription = async (userId) => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    setSubscription(data);
  };

  const checkFeatureAccess = (feature) => {
    if (!subscription) return false;
    
    const tier = subscriptionTiers[subscription.tier];
    return tier.features.includes(feature);
  };

  const checkLimit = (limitType) => {
    if (!subscription) return 0;
    
    const tier = subscriptionTiers[subscription.tier];
    return tier.limits[limitType] || 0;
  };

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      loading,
      checkFeatureAccess,
      checkLimit
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 2.2 Subscription Management Component
```javascript
// components/subscription/SubscriptionManager.jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '@/lib/auth-context';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionManager() {
  const { subscription, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          userId: user.id,
          email: user.email
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div className="subscription-manager">
      <h2>Manage Subscription</h2>
      
      {!subscription ? (
        <PricingTiers onSubscribe={handleSubscribe} loading={loading} />
      ) : (
        <CurrentSubscription 
          subscription={subscription} 
          onManageBilling={handleManageBilling}
        />
      )}
    </div>
  );
}
```

## Phase 3: Feature Gates & Usage Tracking (Weeks 3-4)

### 3.1 Feature Gate HOC
```javascript
// components/auth/FeatureGate.jsx
import { useAuth } from '@/lib/auth-context';
import { Lock } from 'lucide-react';

export function FeatureGate({ feature, children, fallback }) {
  const { checkFeatureAccess, subscription } = useAuth();
  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="feature-gate">
      <Lock className="w-12 h-12 text-gray-400 mb-4" />
      <h3>Upgrade Required</h3>
      <p>This feature is available in higher tiers</p>
      <UpgradePrompt feature={feature} />
    </div>
  );
}

// Usage-based gating
export function UsageGate({ limitType, children }) {
  const { checkLimit, subscription } = useAuth();
  const limit = checkLimit(limitType);
  const currentUsage = subscription?.usage?.[limitType] || 0;

  if (limit === -1 || currentUsage < limit) {
    return children;
  }

  return (
    <div className="usage-gate">
      <p>Limit reached for {limitType}</p>
      <UpgradePrompt />
    </div>
  );
}
```

### 3.2 Usage Tracking Hook
```javascript
// hooks/useUsageTracking.js
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export function useUsageTracking() {
  const { user } = useAuth();

  const trackUsage = async (feature, increment = 1) => {
    if (!user) return;

    try {
      await supabase.rpc('increment_usage', {
        user_id: user.id,
        feature_name: feature,
        increment_count: increment
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const getUsage = async (feature) => {
    if (!user) return 0;

    const { data } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('feature_name', feature)
      .single();

    return data?.usage_count || 0;
  };

  return { trackUsage, getUsage };
}
```

## Phase 4: Billing & Invoicing (Weeks 4-5)

### 4.1 Webhook Handlers
```javascript
// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabase } = require('../../lib/supabase');

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  switch (stripeEvent.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(stripeEvent.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(stripeEvent.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(stripeEvent.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailure(stripeEvent.data.object);
      break;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  
  // Update user subscription in database
  await supabase
    .from('users')
    .update({
      subscription_tier: subscription.items.data[0].price.lookup_key,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId);
}
```

## Phase 5: Advanced Features Implementation (Weeks 5-8)

### 5.1 AI Usage Credits
```javascript
// components/ai/AIUsageTracker.jsx
export function AIUsageTracker() {
  const { subscription } = useAuth();
  const { getUsage } = useUsageTracking();
  const [aiUsage, setAiUsage] = useState(0);

  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getUsage('ai_requests');
      setAiUsage(usage);
    };
    fetchUsage();
  }, []);

  const aiLimit = subscription?.limits?.ai_requests || 0;
  const usagePercentage = aiLimit > 0 ? (aiUsage / aiLimit) * 100 : 0;

  return (
    <div className="ai-usage-tracker">
      <div className="usage-bar">
        <div 
          className="usage-fill" 
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      <p>{aiUsage} / {aiLimit} AI requests used</p>
      {usagePercentage >= 80 && <UpgradePrompt />}
    </div>
  );
}
```

### 5.2 Marketplace Integration
```javascript
// components/marketplace/MarketplaceProvider.jsx
export function MarketplaceProvider({ children }) {
  const { user } = useAuth();
  
  const purchaseService = async (serviceId, providerId, amount) => {
    // Process marketplace purchase
    const response = await fetch('/api/marketplace/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId,
        providerId,
        amount,
        userId: user.id
      })
    });

    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const calculateCommission = (amount, serviceType) => {
    const commissionRates = {
      expert_witness: 0.15,
      process_server: 0.12,
      court_reporter: 0.10,
      document_prep: 0.25
    };

    return amount * (commissionRates[serviceType] || 0.20);
  };

  return (
    <MarketplaceContext.Provider value={{
      purchaseService,
      calculateCommission
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
}
```

## Phase 6: Analytics & Optimization (Weeks 8-12)

### 6.1 Revenue Analytics Dashboard
```javascript
// components/analytics/RevenueDashboard.jsx
export function RevenueDashboard() {
  const [metrics, setMetrics] = useState({
    mrr: 0,
    arr: 0,
    churn: 0,
    ltv: 0,
    customers: 0
  });

  useEffect(() => {
    fetchRevenueMetrics();
  }, []);

  const fetchRevenueMetrics = async () => {
    const response = await fetch('/api/analytics/revenue');
    const data = await response.json();
    setMetrics(data);
  };

  return (
    <div className="revenue-dashboard">
      <MetricCard title="MRR" value={`$${metrics.mrr.toLocaleString()}`} />
      <MetricCard title="ARR" value={`$${metrics.arr.toLocaleString()}`} />
      <MetricCard title="Churn Rate" value={`${metrics.churn}%`} />
      <MetricCard title="LTV" value={`$${metrics.ltv.toLocaleString()}`} />
    </div>
  );
}
```

## Deployment Checklist

### Pre-Launch
- [ ] Stripe account setup and verification
- [ ] Webhook endpoints configured
- [ ] Database schema deployed
- [ ] Pricing page created
- [ ] Subscription flows tested
- [ ] Usage tracking verified
- [ ] Customer support system ready

### Launch Day
- [ ] Monitor payment processing
- [ ] Customer support ready
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] Backup systems tested

### Post-Launch
- [ ] Revenue metrics tracking
- [ ] Customer feedback collection
- [ ] Feature usage analysis
- [ ] Pricing optimization
- [ ] Scale infrastructure as needed

## Testing Strategy

### Unit Tests
- Subscription tier validation
- Feature access control
- Usage tracking accuracy
- Payment processing flows

### Integration Tests
- Stripe webhook handling
- Database transactions
- User authentication flows
- API rate limiting

### End-to-End Tests
- Complete subscription flow
- Feature usage limits
- Upgrade/downgrade scenarios
- Cancellation flows