import { Router } from "express";
import { SubscriptionService } from "./subscription";
import { authenticateUser, type AuthRequest } from "./auth";
import Stripe from "stripe";

const router = Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Get user's subscription status
router.get("/status", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const status = await SubscriptionService.getUserSubscriptionStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ error: "Failed to get subscription status" });
  }
});

// Start subscription (for trial or paid)
router.post("/start", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { subscription, clientSecret } = await SubscriptionService.getOrCreateSubscription(req.user.id);
    
    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    });
  } catch (error) {
    console.error("Error starting subscription:", error);
    res.status(500).json({ error: "Failed to start subscription" });
  }
});

// Cancel subscription
router.post("/cancel", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    await SubscriptionService.cancelSubscription(req.user.id);
    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Get customer portal link
router.post("/portal", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${req.protocol}://${req.get("host")}/`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

// Webhook endpoint for Stripe events
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    return res.status(400).send("No signature provided");
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    await SubscriptionService.processWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }
});

export default router;