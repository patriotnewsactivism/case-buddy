const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verify user from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const userId = authHeader.replace('Bearer ', '');

    const { feature, increment, metadata } = JSON.parse(event.body);

    if (!feature || typeof increment !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get user's current subscription tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Check if subscription is active
    if (user.subscription_status !== 'active') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Subscription not active' })
      };
    }

    // Get tier limits
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('limits')
      .eq('id', user.subscription_tier)
      .single();

    if (!tier) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Tier not found' })
      };
    }

    const limits = tier.limits || {};
    const featureLimit = limits[feature] || -1;

    // Check if incrementing would exceed limit
    if (featureLimit !== -1) {
      const { data: currentUsage } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_name', feature)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .single();

      const currentCount = currentUsage?.usage_count || 0;
      
      if (currentCount + increment > featureLimit) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Usage limit exceeded',
            current: currentCount,
            limit: featureLimit,
            remaining: Math.max(0, featureLimit - currentCount)
          })
        };
      }
    }

    // Upsert usage tracking
    const { error: upsertError } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        feature_name: feature,
        usage_date: new Date().toISOString().split('T')[0],
        usage_count: increment,
        metadata: metadata || {}
      }, {
        onConflict: 'user_id,feature_name,usage_date',
        ignoreDuplicates: false
      })
      .eq('user_id', userId)
      .eq('feature_name', feature)
      .eq('usage_date', new Date().toISOString().split('T')[0]);

    if (upsertError) {
      throw upsertError;
    }

    // If upsert didn't update (conflict), increment the count
    if (increment > 1) {
      const { error: incrementError } = await supabase.rpc('increment_usage', {
        user_id: userId,
        feature_name: feature,
        increment_count: increment
      });

      if (incrementError) {
        throw incrementError;
      }
    }

    // Get updated usage
    const { data: updatedUsage } = await supabase
      .from('usage_tracking')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('feature_name', feature)
      .eq('usage_date', new Date().toISOString().split('T')[0])
      .single();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: updatedUsage?.usage_count || increment,
        limit: featureLimit,
        remaining: featureLimit === -1 ? -1 : Math.max(0, featureLimit - (updatedUsage?.usage_count || 0))
      })
    };

  } catch (error) {
    console.error('Error tracking usage:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};