-- Create subscription system tables

-- Subscription tiers
CREATE TABLE subscription_tiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_annual INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    limits JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;

-- Usage tracking
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, feature_name, usage_date)
);

-- Billing history
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    billing_period_start DATE,
    billing_period_end DATE,
    invoice_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription history
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    event VARCHAR(100) NOT NULL,
    stripe_subscription_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feature access log
CREATE TABLE feature_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    accessed_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Usage alerts
CREATE TABLE usage_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    threshold_percentage INTEGER NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert subscription tiers
INSERT INTO subscription_tiers (id, name, price_monthly, price_annual, features, limits, description, popular) VALUES
('free', 'Free', 0, 0, 
 '["Basic case management", "3 documents per month", "Community support", "Basic timeline"]'::jsonb,
 '{"documents": 3, "ai_requests": 5, "team_members": 1, "storage_gb": 1}'::jsonb,
 'Perfect for getting started with case management', false),

('pro_se', 'Pro Se', 4900, 49000, 
 '["Unlimited cases", "50 documents per month", "AI document analysis", "Deadline tracking", "Email support", "Legal templates"]'::jsonb,
 '{"documents": 50, "ai_requests": 100, "team_members": 1, "storage_gb": 10}'::jsonb,
 'Ideal for individuals representing themselves', false),

('attorney', 'Attorney', 14900, 149000, 
 '["Unlimited documents", "Advanced AI analysis", "Client portal", "Time tracking", "Billing integration", "Priority support", "Phone support"]'::jsonb,
 '{"documents": -1, "ai_requests": 500, "team_members": 1, "storage_gb": 100}'::jsonb,
 'Professional tools for solo practitioners', true),

('law_firm', 'Law Firm', 39900, 399000, 
 '["5 team members", "Advanced analytics", "Custom branding", "Team collaboration", "API access", "Dedicated support"]'::jsonb,
 '{"documents": -1, "ai_requests": 2000, "team_members": 5, "storage_gb": 1000}'::jsonb,
 'Collaboration tools for growing firms', false),

('enterprise', 'Enterprise', 199900, 1999000, 
 '["20+ team members", "Custom integrations", "White-label options", "24/7 support", "SLA guarantee", "Custom development"]'::jsonb,
 '{"documents": -1, "ai_requests": -1, "team_members": 20, "storage_gb": -1}'::jsonb,
 'Full-featured solution for large organizations', false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature_name);
CREATE INDEX IF NOT EXISTS idx_billing_history_user ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_user ON feature_access_log(user_id);

-- Create functions for usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
    target_user_id UUID,
    target_feature_name VARCHAR(100),
    increment_count INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    INSERT INTO usage_tracking (user_id, feature_name, usage_count)
    VALUES (target_user_id, target_feature_name, increment_count)
    ON CONFLICT (user_id, feature_name, usage_date)
    DO UPDATE SET usage_count = usage_tracking.usage_count + increment_count
    RETURNING usage_count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user limits
CREATE OR REPLACE FUNCTION get_user_limits(user_uuid UUID)
RETURNS TABLE(
    tier VARCHAR(50),
    limits JSONB,
    features JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT st.id, st.limits, st.features
    FROM users u
    JOIN subscription_tiers st ON u.subscription_tier = st.id
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to check feature access
CREATE OR REPLACE FUNCTION can_access_feature(
    user_uuid UUID,
    feature_name VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    user_tier VARCHAR(50);
    user_limits JSONB;
    user_features JSONB;
BEGIN
    SELECT subscription_tier INTO user_tier FROM users WHERE id = user_uuid;
    
    IF user_tier IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT limits, features INTO user_limits, user_features
    FROM subscription_tiers WHERE id = user_tier;
    
    -- Check if feature is in features array
    RETURN user_features @> ('["' || feature_name || '"]')::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Function to check usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(
    user_uuid UUID,
    feature_name VARCHAR(100),
    requested_amount INTEGER DEFAULT 1
) RETURNS TABLE(
    allowed BOOLEAN,
    current_usage INTEGER,
    limit_value INTEGER,
    remaining INTEGER
) AS $$
DECLARE
    user_tier VARCHAR(50);
    tier_limits JSONB;
    limit_val INTEGER;
    current_usage_val INTEGER;
BEGIN
    SELECT subscription_tier INTO user_tier FROM users WHERE id = user_uuid;
    
    IF user_tier IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 0, 0;
        RETURN;
    END IF;
    
    SELECT limits INTO tier_limits FROM subscription_tiers WHERE id = user_tier;
    limit_val := COALESCE((tier_limits ->> feature_name)::INTEGER, -1);
    
    SELECT COALESCE(usage_count, 0) INTO current_usage_val
    FROM usage_tracking
    WHERE user_id = user_uuid 
    AND feature_name = feature_name 
    AND usage_date = CURRENT_DATE;
    
    IF limit_val = -1 THEN
        RETURN QUERY SELECT TRUE, current_usage_val, -1, -1;
    ELSE
        RETURN QUERY SELECT 
            (current_usage_val + requested_amount <= limit_val),
            current_usage_val,
            limit_val,
            GREATEST(0, limit_val - current_usage_val);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own billing" ON billing_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription history" ON subscription_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON usage_tracking
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage" ON usage_tracking
    FOR UPDATE USING (true);