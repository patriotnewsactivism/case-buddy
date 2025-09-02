import { eq, and, gte, lte, isNull, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { couponCodes, couponUsage, type CouponCode, type InsertCouponCode, type InsertCouponUsage } from '@shared/schema';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: CouponCode;
  error?: string;
  discountAmount?: number;
  finalAmount?: number;
}

export interface CreateCouponRequest extends Omit<InsertCouponCode, 'code'> {
  code?: string; // Optional - will generate if not provided
}

export class CouponService {
  
  /**
   * Generate a unique coupon code
   */
  generateCouponCode(prefix: string = '', length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix.toUpperCase();
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Create a new coupon code
   */
  async createCoupon(data: CreateCouponRequest): Promise<CouponCode> {
    // Generate code if not provided
    let couponCode = data.code;
    if (!couponCode) {
      // Generate unique code
      let attempts = 0;
      do {
        couponCode = this.generateCouponCode('', 8);
        attempts++;
        
        // Check if code already exists
        const existing = await db.select()
          .from(couponCodes)
          .where(eq(couponCodes.code, couponCode))
          .limit(1);
          
        if (existing.length === 0) break;
        
        if (attempts > 10) {
          throw new Error('Failed to generate unique coupon code');
        }
      } while (true);
    }

    const [coupon] = await db.insert(couponCodes)
      .values({
        ...data,
        code: couponCode,
        updatedAt: new Date(),
      })
      .returning();

    return coupon;
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<CouponCode | null> {
    const [coupon] = await db.select()
      .from(couponCodes)
      .where(eq(couponCodes.code, code.toUpperCase()))
      .limit(1);

    return coupon || null;
  }

  /**
   * Validate coupon for use
   */
  async validateCoupon(
    code: string,
    userId?: string,
    orderAmount?: number,
    planType?: string
  ): Promise<CouponValidationResult> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: 'Coupon code not found' };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, error: 'Coupon code is no longer active' };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, error: 'Coupon code is not yet valid' };
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, error: 'Coupon code has expired' };
    }

    // Check usage limits
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { valid: false, error: 'Coupon code has reached its usage limit' };
    }

    // Check if user has already used this coupon (for single-use coupons)
    if (userId && coupon.maxUses === 1) {
      const existingUsage = await db.select()
        .from(couponUsage)
        .where(and(
          eq(couponUsage.couponId, coupon.id),
          eq(couponUsage.userId, userId)
        ))
        .limit(1);

      if (existingUsage.length > 0) {
        return { valid: false, error: 'You have already used this coupon code' };
      }
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderAmount && orderAmount < parseFloat(coupon.minOrderValue)) {
      return { 
        valid: false, 
        error: `Minimum order value of $${coupon.minOrderValue} required` 
      };
    }

    // Check applicable plans
    if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && planType) {
      if (!coupon.applicablePlans.includes(planType)) {
        return { valid: false, error: 'Coupon code is not applicable to this plan' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    let finalAmount = orderAmount || 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (finalAmount * parseFloat(coupon.discountValue)) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(parseFloat(coupon.discountValue), finalAmount);
    }

    finalAmount = Math.max(0, finalAmount - discountAmount);

    return {
      valid: true,
      coupon,
      discountAmount,
      finalAmount,
    };
  }

  /**
   * Apply coupon and record usage
   */
  async applyCoupon(
    couponId: number,
    userId: string,
    originalAmount: number,
    discountApplied: number,
    subscriptionId?: string,
    metadata?: any
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Record usage
      await tx.insert(couponUsage).values({
        couponId,
        userId,
        discountApplied: discountApplied.toString(),
        originalAmount: originalAmount.toString(),
        finalAmount: (originalAmount - discountApplied).toString(),
        subscriptionId,
        metadata,
      });

      // Increment usage count
      await tx.update(couponCodes)
        .set({
          currentUses: sql`${couponCodes.currentUses} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(couponCodes.id, couponId));
    });
  }

  /**
   * Get all coupons (admin function)
   */
  async getAllCoupons(): Promise<CouponCode[]> {
    return await db.select().from(couponCodes).orderBy(couponCodes.createdAt);
  }

  /**
   * Update coupon
   */
  async updateCoupon(id: number, data: Partial<InsertCouponCode>): Promise<CouponCode> {
    const [coupon] = await db.update(couponCodes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(couponCodes.id, id))
      .returning();

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    return coupon;
  }

  /**
   * Deactivate coupon
   */
  async deactivateCoupon(id: number): Promise<CouponCode> {
    return this.updateCoupon(id, { isActive: false });
  }

  /**
   * Get coupon usage analytics
   */
  async getCouponAnalytics(couponId?: number) {
    const query = db.select()
      .from(couponUsage)
      .leftJoin(couponCodes, eq(couponUsage.couponId, couponCodes.id));

    if (couponId) {
      query.where(eq(couponUsage.couponId, couponId));
    }

    const usage = await query;

    // Calculate analytics
    const totalUsage = usage.length;
    const totalDiscountGiven = usage.reduce((sum, u) => sum + parseFloat(u.coupon_usage.discountApplied), 0);
    const totalOriginalValue = usage.reduce((sum, u) => sum + parseFloat(u.coupon_usage.originalAmount), 0);

    return {
      totalUsage,
      totalDiscountGiven,
      totalOriginalValue,
      averageDiscountPerUse: totalUsage > 0 ? totalDiscountGiven / totalUsage : 0,
      usage,
    };
  }

  /**
   * Bulk create coupons
   */
  async bulkCreateCoupons(
    template: CreateCouponRequest,
    count: number,
    prefix: string = ''
  ): Promise<CouponCode[]> {
    const coupons: CouponCode[] = [];
    
    for (let i = 0; i < count; i++) {
      const couponCode = this.generateCouponCode(prefix, 8);
      const coupon = await this.createCoupon({
        ...template,
        code: couponCode,
      });
      coupons.push(coupon);
    }

    return coupons;
  }
}

export const couponService = new CouponService();