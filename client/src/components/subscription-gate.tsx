import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Clock, Zap, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

interface SubscriptionGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
}

export function SubscriptionGate({ children, feature, description }: SubscriptionGateProps) {
  const { hasActiveSubscription, isTrialActive, daysRemainingInTrial, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking subscription...</p>
        </div>
      </div>
    );
  }

  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {isTrialActive 
              ? `Upgrade to Continue Using ${feature}`
              : `Unlock ${feature} with CaseBuddy Pro`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isTrialActive && daysRemainingInTrial > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="w-4 h-4" />
              <AlertDescription>
                Your free trial expires in {daysRemainingInTrial} day{daysRemainingInTrial !== 1 ? 's' : ''}. 
                Upgrade now to continue using all pro features.
              </AlertDescription>
            </Alert>
          )}

          {!isTrialActive && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Your trial has expired. Upgrade to CaseBuddy Pro to regain access to premium features.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{feature}</span>
            </div>
            
            {description && (
              <p className="text-muted-foreground max-w-md mx-auto">
                {description}
              </p>
            )}

            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <p className="text-lg font-semibold">
                CaseBuddy Pro - $14.95/month
              </p>
              <p className="text-sm text-muted-foreground">
                14-day free trial • Cancel anytime
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/subscription">
                <Button size="lg" className="w-full max-w-sm mx-auto" data-testid="button-upgrade-subscription">
                  <Crown className="w-4 h-4 mr-2" />
                  {isTrialActive ? "Upgrade Now" : "Start Free Trial"}
                </Button>
              </Link>
              
              <p className="text-xs text-muted-foreground">
                Get instant access to all premium legal analytics and AI features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}