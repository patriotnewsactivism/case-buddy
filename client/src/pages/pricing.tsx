import React, { useState } from 'react';
import { Check, X, Zap, Users, FileText, Clock, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const tiers = [
  {
    name: 'Pro Se',
    description: 'Perfect for individuals representing themselves',
    price: 49,
    priceAnnual: 490,
    features: [
      'Unlimited cases',
      '50 documents per month',
      'Basic AI document analysis',
      'Deadline tracking',
      'Basic timeline',
      'Email support',
      'Community forum'
    ],
    limits: {
      documents: 50,
      aiRequests: 100,
      teamMembers: 1,
      storage: '10GB'
    },
    popular: false,
    recommended: 'Pro Se litigants'
  },
  {
    name: 'Attorney',
    description: 'Professional tools for solo practitioners',
    price: 149,
    priceAnnual: 1490,
    features: [
      'Unlimited documents',
      'Advanced AI analysis',
      'Client portal',
      'Time tracking',
      'Billing integration',
      'Priority support',
      'Phone support',
      'Legal templates'
    ],
    limits: {
      documents: -1,
      aiRequests: 500,
      teamMembers: 1,
      storage: '100GB'
    },
    popular: true,
    recommended: 'Solo practitioners'
  },
  {
    name: 'Law Firm',
    description: 'Collaboration tools for small to medium firms',
    price: 399,
    priceAnnual: 3990,
    features: [
      '5 team members',
      'Advanced analytics',
      'Custom branding',
      'Team collaboration',
      'Advanced security',
      'Dedicated support',
      'API access',
      'White-label options'
    ],
    limits: {
      documents: -1,
      aiRequests: 2000,
      teamMembers: 5,
      storage: '1TB'
    },
    popular: false,
    recommended: 'Small to medium firms'
  },
  {
    name: 'Enterprise',
    description: 'Full-featured solution for large organizations',
    price: 1999,
    priceAnnual: 19990,
    features: [
      '20+ team members',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 support',
      'SLA guarantee',
      'Custom development',
      'Advanced security',
      'Compliance tools'
    ],
    limits: {
      documents: -1,
      aiRequests: -1,
      teamMembers: 20,
      storage: 'Unlimited'
    },
    popular: false,
    recommended: 'Large firms & enterprises'
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (tierName: string) => {
    setLoading(tierName);
    
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierName.toLowerCase().replace(' ', '-'),
          billingCycle,
          userId: user?.id,
          email: user?.email
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  const calculateSavings = (price: number, priceAnnual: number) => {
    const monthlyTotal = price * 12;
    const savings = monthlyTotal - priceAnnual;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { savings, percentage };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start your 14-day free trial. No credit card required.
          </p>
          
          <div className="mt-8 flex justify-center">
            <div className="relative bg-gray-100 p-1 rounded-lg">
              <div className="flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                  } relative py-2 px-4 rounded-md text-sm font-medium transition-all`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`${
                    billingCycle === 'annual'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                  } relative py-2 px-4 rounded-md text-sm font-medium transition-all`}
                >
                  Annual (Save 15%)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {tiers.map((tier) => {
            const { savings, percentage } = calculateSavings(tier.price, tier.priceAnnual);
            
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-lg shadow-lg p-6 ${
                  tier.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                  <p className="mt-4 text-sm text-gray-500">For {tier.recommended}</p>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${billingCycle === 'monthly' ? tier.price : tier.priceAnnual}
                      </span>
                      <span className="ml-1 text-gray-500">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    
                    {billingCycle === 'annual' && (
                      <p className="mt-2 text-sm text-green-600">
                        Save ${savings} ({percentage}% off)
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="ml-3 text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={loading === tier.name}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
                      tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.name ? 'Processing...' : 'Start Free Trial'}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <div className="text-sm text-gray-500">
                    <p>Limits:</p>
                    <ul className="mt-2 space-y-1">
                      <li>Documents: {tier.limits.documents === -1 ? 'Unlimited' : tier.limits.documents}</li>
                      <li>AI Requests: {tier.limits.aiRequests === -1 ? 'Unlimited' : tier.limits.aiRequests}</li>
                      <li>Team Members: {tier.limits.teamMembers}</li>
                      <li>Storage: {tier.limits.storage}</li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Compare All Features</h2>
          </div>
          
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 font-medium text-gray-900">Features</th>
                  {tiers.map((tier) => (
                    <th key={tier.name} className="text-center py-4 px-4 font-medium text-gray-900">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  'AI Document Analysis',
                  'Case Strategy Generator',
                  'Legal Research',
                  'Judge Analytics',
                  'Client Portal',
                  'Time Tracking',
                  'Billing Integration',
                  'Team Collaboration',
                  'Custom Branding',
                  'API Access',
                  'White-label Options',
                  'Priority Support',
                  'Phone Support',
                  'Dedicated Account Manager',
                  '24/7 Support'
                ].map((feature) => (
                  <tr key={feature}>
                    <td className="py-4 px-4 text-sm text-gray-900">{feature}</td>
                    {tiers.map((tier) => (
                      <td key={tier.name} className="text-center py-4 px-4">
                        {tier.features.some(f => f.toLowerCase().includes(feature.toLowerCase())) ||
                         tier.features.includes(feature) ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Questions?</h2>
          <p className="mt-4 text-gray-600">
            Contact our sales team for custom enterprise solutions or questions about pricing.
          </p>
          <div className="mt-8">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Contact Sales
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}