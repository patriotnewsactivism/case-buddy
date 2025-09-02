import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "./subscription";
import { AuthRequest } from "./auth";

export interface SubscriptionRequest extends AuthRequest {
  hasActiveSubscription?: boolean;
  subscriptionStatus?: {
    status: string;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
  };
}

export const checkSubscription = async (
  req: SubscriptionRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      req.hasActiveSubscription = false;
      return next();
    }

    const status = await SubscriptionService.getUserSubscriptionStatus(req.user.id);
    req.hasActiveSubscription = status.isSubscriptionActive;
    req.subscriptionStatus = status;
    
    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    req.hasActiveSubscription = false;
    next();
  }
};

export const requireActiveSubscription = (
  req: SubscriptionRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Allow in development mode for testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (!req.hasActiveSubscription) {
    return res.status(403).json({ 
      error: "Active subscription required",
      trialEnded: req.subscriptionStatus?.status === "trial" && !req.subscriptionStatus?.isTrialActive
    });
  }
  next();
};