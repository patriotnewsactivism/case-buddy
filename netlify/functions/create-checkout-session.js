const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { tier, billingCycle, userId, email } = JSON.parse(event.body);

    // Validate input
    if (!tier || !userId || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: userId
        }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Price mapping
    const priceMap = {
      'pro-se': billingCycle === 'annual' 
        ? process.env.STRIPE_PRO_SE_ANNUAL_PRICE_ID 
        : process.env.STRIPE_PRO_SE_MONTHLY_PRICE_ID,
      'attorney': billingCycle === 'annual' 
        ? process.env.STRIPE_ATTORNEY_ANNUAL_PRICE_ID 
        : process.env.STRIPE_ATTORNEY_MONTHLY_PRICE_ID,
      'law-firm': billingCycle === 'annual' 
        ? process.env.STRIPE_FIRM_ANNUAL_PRICE_ID 
        : process.env.STRIPE_FIRM_MONTHLY_PRICE_ID,
      'enterprise': billingCycle === 'annual' 
        ? process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID 
        : process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
    };

    const priceId = priceMap[tier];
    
    if (!priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid tier' })
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        user_id: userId,
        tier: tier
      },
      subscription_data: {
        trial_period_days: tier === 'free' ? 0 : 14,
        metadata: {
          user_id: userId,
          tier: tier
        }
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};