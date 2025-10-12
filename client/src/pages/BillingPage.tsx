import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription';
import { createPortalSession } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
}

interface UsageData {
  feature_name: string;
  usage_count: number;
  usage_date: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { tier, status, trialEndDate, loading: subscriptionLoading } = useSubscription();
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    if (!user) return;

    try {
      // Load billing history
      const { data: history } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBillingHistory(history || []);

      // Load usage data
      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_date', { ascending: false })
        .limit(30);

      setUsageData(usage || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;

    setPortalLoading(true);
    try {
      const url = await createPortalSession(user.id);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {tier.replace('_', ' ')} Plan
            </h3>
            <p className="text-gray-600">Status: {status}</p>
            
            {trialEndDate && status === 'trialing' && (
              <div className="mt-2 flex items-center text-blue-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Trial ends {formatDate(trialEndDate.toString())}
                </span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Usage Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Documents:</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span>AI Requests:</span>
                <span className="font-medium">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="font-medium">Unlimited</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing History</h2>
        
        {billingHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No billing history yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Period</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-3 px-4">{formatDate(invoice.created_at)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(invoice.amount)}</td>
                    <td className="py-3 px-4">
                      {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {invoice.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Analytics</h2>
        
        {usageData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No usage data yet
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Recent Usage</h3>
              <div className="space-y-2">
                {usageData.slice(0, 5).map((usage) => (
                  <div key={usage.usage_date + usage.feature_name} className="flex justify-between text-sm">
                    <span className="capitalize">{usage.feature_name.replace('_', ' ')}</span>
                    <span className="font-medium">{usage.usage_count} uses</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Plan Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Plan:</span>
                  <span className="font-medium capitalize">{tier.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Cycle:</span>
                  <span className="font-medium">Monthly</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}