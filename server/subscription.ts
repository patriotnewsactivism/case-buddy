import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export class SubscriptionService {
  private static readonly PRICE_ID = "price_casebuddy_monthly"; // This will be created in Stripe dashboard
  private static readonly TRIAL_DAYS = 14;

  static async createCustomer(user: User): Promise<string> {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      metadata: {
        userId: user.id,
      },
    });

    // Update user with Stripe customer ID
    await db
      .update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, user.id));

    return customer.id;
  }

  static async createTrialSubscription(customerId: string, userId: string): Promise<Stripe.Subscription> {
    // For now, we'll create a trial period by setting trial_end timestamp
    const trialEnd = Math.floor((Date.now() + (this.TRIAL_DAYS * 24 * 60 * 60 * 1000)) / 1000);

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CaseBuddy Pro",
              description: "Your Legal Case Assistant - Professional Plan",
            },
            recurring: {
              interval: "month",
            },
            unit_amount: 1495, // $14.95 in cents
          },
        },
      ],
      trial_end: trialEnd,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    // Update user with subscription details
    const trialEndsAt = new Date(trialEnd * 1000);
    await db
      .update(users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: "trial",
        trialEndsAt,
      })
      .where(eq(users.id, userId));

    return subscription;
  }

  static async getOrCreateSubscription(userId: string): Promise<{
    subscription: Stripe.Subscription;
    clientSecret?: string;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // If user already has a subscription, return it
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      let clientSecret: string | undefined;

      // If subscription needs payment, get client secret
      if (subscription.status === "incomplete" && subscription.latest_invoice) {
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ["payment_intent"],
        });
        if (invoice.payment_intent && typeof invoice.payment_intent === "object") {
          clientSecret = invoice.payment_intent.client_secret || undefined;
        }
      }

      return { subscription, clientSecret };
    }

    // Create customer if doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.createCustomer(user);
    }

    // Create trial subscription
    const subscription = await this.createTrialSubscription(customerId, userId);
    let clientSecret: string | undefined;

    if (subscription.latest_invoice && typeof subscription.latest_invoice === "object") {
      const paymentIntent = subscription.latest_invoice.payment_intent;
      if (paymentIntent && typeof paymentIntent === "object") {
        clientSecret = paymentIntent.client_secret || undefined;
      }
    }

    return { subscription, clientSecret };
  }

  static async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeSubscriptionId, subscriptionId));

    if (user) {
      const updates: any = { subscriptionStatus: status };
      
      if (status === "active") {
        // Calculate subscription end date (1 month from now)
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
        updates.subscriptionEndsAt = subscriptionEndsAt;
      }

      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, user.id));
    }
  }

  static async cancelSubscription(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await db
      .update(users)
      .set({ subscriptionStatus: "canceled" })
      .where(eq(users.id, userId));
  }

  static async getUserSubscriptionStatus(userId: string): Promise<{
    status: string;
    trialEndsAt?: Date;
    subscriptionEndsAt?: Date;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const isTrialActive = user.trialEndsAt ? now < user.trialEndsAt : false;
    const isSubscriptionActive = 
      user.subscriptionStatus === "active" || 
      (user.subscriptionStatus === "trial" && isTrialActive);

    return {
      status: user.subscriptionStatus || "trial",
      trialEndsAt: user.trialEndsAt || undefined,
      subscriptionEndsAt: user.subscriptionEndsAt || undefined,
      isTrialActive,
      isSubscriptionActive,
    };
  }

  static async processWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionStatus(subscription.id, subscription.status);
        break;
      
      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.subscription === "string") {
          await this.updateSubscriptionStatus(invoice.subscription, "active");
        }
        break;
        
      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        if (failedInvoice.subscription && typeof failedInvoice.subscription === "string") {
          await this.updateSubscriptionStatus(failedInvoice.subscription, "past_due");
        }
        break;
    }
  }
}