import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle, Loader2, Percent, DollarSign } from 'lucide-react';

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

interface CouponInputProps {
  orderAmount: number;
  planType?: string;
  onCouponApplied: (coupon: CouponValidationResult) => void;
  onCouponRemoved: () => void;
}

export function CouponInput({ orderAmount, planType, onCouponApplied, onCouponRemoved }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const response = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        data: {
          code: couponCode.trim().toUpperCase(),
          orderAmount,
          planType,
        }
      });

      const result = response as CouponValidationResult;
      setValidationResult(result);

      if (result.valid) {
        onCouponApplied(result);
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: error.message || 'Failed to validate coupon'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setValidationResult(null);
    onCouponRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
          <Input
            id="couponCode"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter coupon code"
            disabled={validationResult?.valid || isValidating}
            data-testid="input-coupon-code"
          />
        </div>
        <div className="flex flex-col justify-end">
          {!validationResult?.valid ? (
            <Button
              type="button"
              onClick={validateCoupon}
              disabled={!couponCode.trim() || isValidating}
              variant="outline"
              data-testid="button-apply-coupon"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={removeCoupon}
              variant="outline"
              data-testid="button-remove-coupon"
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <Card className={`border-2 ${validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              {validationResult.valid ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                {validationResult.valid && validationResult.coupon ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {validationResult.coupon.code}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {validationResult.coupon.discountType === 'percentage' ? (
                          <><Percent className="w-3 h-3 mr-1" />{validationResult.coupon.discountValue}%</>
                        ) : (
                          <><DollarSign className="w-3 h-3 mr-1" />${validationResult.coupon.discountValue}</>
                        )}
                      </Badge>
                    </div>
                    
                    {validationResult.coupon.description && (
                      <p className="text-sm text-gray-700">
                        {validationResult.coupon.description}
                      </p>
                    )}
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Amount:</span>
                        <span className="font-medium">${orderAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Discount:</span>
                        <span className="font-medium">-${validationResult.discountAmount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-lg">
                        <span>Final Amount:</span>
                        <span>${validationResult.finalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p className="font-medium">Invalid coupon code</p>
                    <p className="text-sm">{validationResult.error}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}