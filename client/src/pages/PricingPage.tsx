import React, { useState, useEffect } from 'react';
import { Check, X, Zap, Users, FileText, Clock, Shield, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription';
import { loadStripe } from '@stripe/stripe-js';
import { getAllTiers, createCheckoutSession } from '@/lib/subscription';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PricingTier {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: any;
  description: string;
  popular: boolean;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    const data = await getAllTiers();
    setTiers(data);
  };

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      alert('Please log in to subscribe');
      return;
    }

    setLoading(tierId);
    
    try {
      const sessionId = await createCheckoutSession(
        user.id,
        tierId,
        billingCycle,
        user.email!
      );

      if (sessionId) {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating checkout session');
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

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(0);
  };

  const getButtonText = (tierId: string) => {
    if (currentTier === tierId) {
      return 'Current Plan';
    }
    if (loading === tierId) {
      return 'Processing...';
    }
    return 'Start Free Trial';
  };

  const getButtonDisabled = (tierId: string) => {
    return currentTier === tierId || loading === tierId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Legal Intelligence Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start your 14-day free trial. No credit card required.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <div className="flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'annual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Annual (Save 15%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2 mb-16">
          {tiers.map((tier) => {
            const { savings, percentage } = calculateSavings(tier.price_monthly, tier.price_annual);
            const isCurrent = currentTier === tier.id;
            
            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-xl shadow-xl overflow-hidden ${
                  tier.popular ? 'ring-4 ring-blue-500' : 'border border-gray-200'
                } ${isCurrent ? 'opacity-75' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <p className="text-gray-600 mb-4">{tier.description}</p>
                    
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ${formatPrice(billingCycle === 'monthly' ? tier.price_monthly : tier.price_annual)}
                      </span>
                      <span className="ml-1 text-gray-500">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    
                    {billingCycle === 'annual' && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        Save ${formatPrice(savings)} ({percentage}% off)
                      </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Features:</h4>
                    <ul className="space-y-3">
                      {tier.features.map((feature: string) => (
                        <li key={feature} className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                          <span className="ml-3 text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Limits:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex justify-between">
                        <span>Documents:</span>
                        <span className="font-medium">{tier.limits.documents === -1 ? 'Unlimited' : tier.limits.documents}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>AI Requests:</span>
                        <span className="font-medium">{tier.limits.ai_requests === -1 ? 'Unlimited' : tier.limits.ai_requests}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Team Members:</span>
                        <span className="font-medium">{tier.limits.team_members}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Storage:</span>
                        <span className="font-medium">{tier.limits.storage_gb === -1 ? 'Unlimited' : `${tier.limits.storage_gb}GB`}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={getButtonDisabled(tier.id)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : tier.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                    } ${loading === tier.id ? 'opacity-50' : ''}`}
                  >
                    {getButtonText(tier.id)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Compare All Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-4 px-4 font-semibold text-gray-900">
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
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{feature}</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="text-center py-4 px-4">
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

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 mb-4">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Is there a contract?</h3>
              <p className="text-gray-600 mb-4">
                No contracts. You can cancel anytime. Annual plans are paid upfront but can be cancelled for a prorated refund.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and ACH transfers for annual plans.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-gray-600 mb-4">
                You get full access to all features for 14 days. No credit card required to start.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 mb-4">
                Yes! We use bank-level encryption and are compliant with attorney-client privilege requirements.
              </p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer training?</h3>
              <p className="text-gray-600">
                Yes! All paid plans include onboarding and training. Enterprise plans get dedicated training sessions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of legal professionals who trust CaseBuddy to win more cases.
          </p>
          <button
            onClick={() => window.location.href = user ? '/dashboard' : '/login'}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            {user ? 'Go to Dashboard' : 'Start Free Trial'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}