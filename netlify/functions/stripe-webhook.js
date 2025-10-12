const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.log('⚠️  Webhook signature verification failed.', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(stripeEvent.data.object);
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
      
    case 'customer.subscription.trial_will_end':
      await handleTrialEnding(stripeEvent.data.object);
      break;
      
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};

async function handleSubscriptionChange(subscription) {
  try {
    const customerId = subscription.customer;
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Map Stripe product to our tier names
    const tierMap = {
      [process.env.STRIPE_PRO_SE_MONTHLY_PRICE_ID]: 'pro_se',
      [process.env.STRIPE_PRO_SE_ANNUAL_PRICE_ID]: 'pro_se',
      [process.env.STRIPE_ATTORNEY_MONTHLY_PRICE_ID]: 'attorney',
      [process.env.STRIPE_ATTORNEY_ANNUAL_PRICE_ID]: 'attorney',
      [process.env.STRIPE_FIRM_MONTHLY_PRICE_ID]: 'law_firm',
      [process.env.STRIPE_FIRM_ANNUAL_PRICE_ID]: 'law_firm',
      [process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID]: 'enterprise',
      [process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID]: 'enterprise'
    };

    const priceId = subscription.items.data[0].price.id;
    const tier = tierMap[priceId];

    if (!tier) {
      console.error('Unknown price ID:', priceId);
      return;
    }

    // Update user subscription
    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_status: subscription.status,
        subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
    }

    // Log subscription change
    await supabase.from('subscription_history').insert({
      user_id: userId,
      tier: tier,
      status: subscription.status,
      event: 'subscription_change',
      stripe_subscription_id: subscription.id,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionCancellation(subscription) {
  try {
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Update user to free tier
    await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Log cancellation
    await supabase.from('subscription_history').insert({
      user_id: userId,
      status: 'canceled',
      event: 'subscription_canceled',
      stripe_subscription_id: subscription.id,
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Record successful payment
    await supabase.from('billing_history').insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
      billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
      created_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Record failed payment
    await supabase.from('billing_history').insert({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      failure_reason: invoice.last_payment_error?.message,
      created_at: new Date().toISOString()
    });

    // Update user subscription status
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleTrialEnding(subscription) {
  try {
    const userId = subscription.metadata?.user_id;
    
    if (!userId) {
      console.error('No user_id in subscription metadata');
      return;
    }

    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (user) {
      // Send trial ending email (implement email service)
      console.log(`Trial ending for user ${user.email}`);
      
      // Log trial ending
      await supabase.from('subscription_history').insert({
        user_id: userId,
        status: 'trial_ending',
        event: 'trial_ending',
        stripe_subscription_id: subscription.id,
        created_at: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error handling trial ending:', error);
  }
}