import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Crown, Clock, CreditCard, Shield, Zap, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CouponInput } from "@/components/coupon-input";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface SubscriptionStatus {
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
}

function SubscriptionForm({ clientSecret, onSuccess, appliedCoupon }: { 
  clientSecret: string; 
  onSuccess: () => void; 
  appliedCoupon?: CouponValidationResult | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Apply coupon if valid
      if (appliedCoupon?.valid && appliedCoupon.coupon) {
        try {
          await apiRequest('/api/coupons/apply', {
            method: 'POST',
            data: {
              couponId: appliedCoupon.coupon.id,
              originalAmount: 14.95,
              discountApplied: appliedCoupon.discountAmount || 0,
              subscriptionId: clientSecret, // Use client secret as temp ID
            }
          });
        } catch (error) {
          console.error('Failed to record coupon usage:', error);
        }
      }

      toast({
        title: "Payment Successful",
        description: appliedCoupon?.valid ? 
          `Welcome to CaseBuddy Pro! Your coupon saved you $${appliedCoupon.discountAmount?.toFixed(2)}` :
          "Welcome to CaseBuddy Pro!",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
        data-testid="button-confirm-payment"
      >
        {isLoading ? "Processing..." : "Confirm Payment"}
      </Button>
    </form>
  );
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: number;
    code: string;
    description: string | null;
    discountType: 'percentage' | 'fixed';
    discountValue: string;
  };
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const MONTHLY_PRICE = 14.95;
  const finalPrice = appliedCoupon?.valid ? appliedCoupon.finalAmount || MONTHLY_PRICE : MONTHLY_PRICE;

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await apiRequest("/api/subscription/status");
      setSubscriptionStatus(response);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("/api/subscription/start", {
        method: "POST",
        data: {
          couponCode: appliedCoupon?.valid ? appliedCoupon.coupon?.code : undefined,
          finalAmount: finalPrice,
        }
      });
      
      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        // Trial started successfully
        toast({
          title: "Trial Started!",
          description: "Your 2-week free trial has begun. Enjoy CaseBuddy Pro!",
        });
        loadSubscriptionStatus();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to pro features at the end of your billing period.")) {
      return;
    }

    try {
      await apiRequest("/api/subscription/cancel", {
        method: "POST",
      });
      
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll retain access until the end of your billing period.",
      });
      
      loadSubscriptionStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await apiRequest("/api/subscription/portal", {
        method: "POST",
      });
      
      window.open(response.url, "_blank");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">CaseBuddy Pro</h1>
        <p className="text-muted-foreground">Your Legal Case Assistant - Professional Plan</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionStatus?.isTrialActive && (
              <Alert className="border-blue-200 bg-blue-50">
                <Clock className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Free Trial Active</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {subscriptionStatus.trialEndsAt && 
                        `${getDaysRemaining(subscriptionStatus.trialEndsAt)} days left`
                      }
                    </Badge>
                  </div>
                  {subscriptionStatus.trialEndsAt && (
                    <p className="text-sm mt-1">
                      Trial ends {formatDate(subscriptionStatus.trialEndsAt)}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {subscriptionStatus?.status === "active" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Pro Plan Active</span>
                    <Badge className="bg-green-100 text-green-800">
                      $14.95/month
                    </Badge>
                  </div>
                  {subscriptionStatus.subscriptionEndsAt && (
                    <p className="text-sm mt-1">
                      Next billing: {formatDate(subscriptionStatus.subscriptionEndsAt)}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {subscriptionStatus?.status === "canceled" && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <span>Subscription Canceled</span>
                  {subscriptionStatus.subscriptionEndsAt && (
                    <p className="text-sm mt-1">
                      Access until {formatDate(subscriptionStatus.subscriptionEndsAt)}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">User</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={subscriptionStatus?.isSubscriptionActive ? "default" : "secondary"}>
                  {subscriptionStatus?.isSubscriptionActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {subscriptionStatus?.status === "trial" && (
                <div className="space-y-4">
                  <CouponInput
                    orderAmount={MONTHLY_PRICE}
                    planType="pro"
                    onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                    onCouponRemoved={() => setAppliedCoupon(null)}
                  />
                  <Button 
                    onClick={handleStartSubscription} 
                    className="w-full"
                    data-testid="button-start-subscription"
                  >
                    Upgrade to Pro (${finalPrice.toFixed(2)}/month)
                  </Button>
                </div>
              )}
              
              {subscriptionStatus?.status === "active" && (
                <>
                  <Button 
                    onClick={handleManageBilling} 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-manage-billing"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                  <Button 
                    onClick={handleCancelSubscription} 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    data-testid="button-cancel-subscription"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Pro Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">AI-Powered Legal Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Case outcome prediction and judge behavior analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Automated Brief Generation</p>
                  <p className="text-sm text-muted-foreground">
                    Professional legal briefs with customizable templates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Advanced Case Management</p>
                  <p className="text-sm text-muted-foreground">
                    Unlimited cases, documents, and timeline events
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Priority Support</p>
                  <p className="text-sm text-muted-foreground">
                    Get help when you need it most
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Secure & Compliant</p>
                  <p className="text-sm text-muted-foreground">
                    Bank-level security for your sensitive legal data
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-center space-y-2">
              {appliedCoupon?.valid && appliedCoupon.discountAmount && (
                <div className="space-y-1">
                  <p className="text-lg text-gray-500 line-through">${MONTHLY_PRICE.toFixed(2)}</p>
                  <p className="text-sm text-green-600">Save ${appliedCoupon.discountAmount.toFixed(2)}</p>
                </div>
              )}
              <p className="text-2xl font-bold">
                ${finalPrice.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <p className="text-sm text-muted-foreground">14-day free trial • Cancel anytime</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      {clientSecret && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Complete Your Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscriptionForm 
                clientSecret={clientSecret} 
                appliedCoupon={appliedCoupon}
                onSuccess={() => {
                  setClientSecret(null);
                  setAppliedCoupon(null);
                  loadSubscriptionStatus();
                }} 
              />
            </Elements>
          </CardContent>
        </Card>
      )}
    </div>
  );
}