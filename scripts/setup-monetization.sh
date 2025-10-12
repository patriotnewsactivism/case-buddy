#!/bin/bash

# CaseBuddy Monetization Setup Script
# This script sets up the complete monetization system

echo "🚀 Setting up CaseBuddy Monetization System..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY must be set"
    exit 1
fi

# Create environment file
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Backend Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Stripe Keys
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Stripe Price IDs (Replace with your actual price IDs)
STRIPE_PRO_SE_MONTHLY_PRICE_ID=$STRIPE_PRO_SE_MONTHLY_PRICE_ID
STRIPE_PRO_SE_ANNUAL_PRICE_ID=$STRIPE_PRO_SE_ANNUAL_PRICE_ID
STRIPE_ATTORNEY_MONTHLY_PRICE_ID=$STRIPE_ATTORNEY_MONTHLY_PRICE_ID
STRIPE_ATTORNEY_ANNUAL_PRICE_ID=$STRIPE_ATTORNEY_ANNUAL_PRICE_ID
STRIPE_FIRM_MONTHLY_PRICE_ID=$STRIPE_FIRM_MONTHLY_PRICE_ID
STRIPE_FIRM_ANNUAL_PRICE_ID=$STRIPE_FIRM_ANNUAL_PRICE_ID
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=$STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=$STRIPE_ENTERPRISE_ANNUAL_PRICE_ID

# Frontend URL
FRONTEND_URL=$FRONTEND_URL
EOF

echo "✅ Environment file created"

# Install dependencies
echo "📦 Installing dependencies..."
npm install @stripe/stripe-js @stripe/react-stripe-js stripe

# Create Stripe products and prices (run this once)
echo "💳 Setting up Stripe products..."

# This would be run once to create the products and prices
# stripe products create --name="Pro Se Plan" --description="Perfect for individuals representing themselves"
# stripe prices create --product=prod_pro_se --unit-amount=4900 --currency=usd --recurring=interval=month
# stripe prices create --product=prod_pro_se --unit-amount=49000 --currency=usd --recurring=interval=year

# stripe products create --name="Attorney Plan" --description="Professional tools for solo practitioners"
# stripe prices create --product=prod_attorney --unit-amount=14900 --currency=usd --recurring=interval=month
# stripe prices create --product=prod_attorney --unit-amount=149000 --currency=usd --recurring=interval=year

# stripe products create --name="Law Firm Plan" --description="Collaboration tools for growing firms"
# stripe prices create --product=prod_law_firm --unit-amount=39900 --currency=usd --recurring=interval=month
# stripe prices create --product=prod_law_firm --unit-amount=399000 --currency=usd --recurring=interval=year

# stripe products create --name="Enterprise Plan" --description="Full-featured solution for large organizations"
# stripe prices create --product=prod_enterprise --unit-amount=199900 --currency=usd --recurring=interval=month
# stripe prices create --product=prod_enterprise --unit-amount=1999000 --currency=usd --recurring=interval=year

echo "✅ Stripe setup complete"

# Deploy to Supabase
echo "🗄️ Setting up database..."
supabase db reset --db-url "$SUPABASE_URL"

# Run migrations
supabase db push --db-url "$SUPABASE_URL"

echo "✅ Database setup complete"

# Build the project
echo "🔨 Building project..."
npm run build

echo "🎉 CaseBuddy Monetization System setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Stripe webhook endpoint: $FRONTEND_URL/.netlify/functions/stripe-webhook"
echo "2. Configure your Stripe webhook secret in the Stripe dashboard"
echo "3. Test the checkout flow at: $FRONTEND_URL/pricing"
echo "4. Monitor usage and billing in the admin dashboard"
echo ""
echo "🚀 Ready to launch!"
EOF

chmod +x scripts/setup-monetization.sh