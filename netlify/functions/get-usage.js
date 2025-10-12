const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    const feature = event.queryStringParameters?.feature;

    if (feature) {
      // Get specific feature usage
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature_name', feature)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .single();

      if (error) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ count: 0 })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: data?.usage_count || 0 })
      };
    }

    // Get all usage for user
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('usage_date', { ascending: false })
      .limit(30);

    if (usageError) {
      throw usageError;
    }

    // Get user tier and limits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('limits')
      .eq('id', user.subscription_tier)
      .single();

    if (tierError) {
      throw tierError;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        usage: usage || [],
        limits: tier.limits || {},
        tier: user.subscription_tier
      })
    };

  } catch (error) {
    console.error('Error getting usage:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};