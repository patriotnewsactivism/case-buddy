import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Edit, Trash2, TrendingUp, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface CouponCode {
  id: number;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  minOrderValue: string | null;
  applicablePlans: string[] | null;
}

interface CouponFormData {
  code?: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
  minOrderValue: string;
  applicablePlans: string[];
}

export default function AdminCoupons() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coupons
  const { data: couponsData, isLoading } = useQuery({
    queryKey: ['/api/admin/coupons'],
    retry: false,
  });

  const coupons: CouponCode[] = (couponsData as any)?.coupons || [];

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/coupons/analytics'],
    retry: false,
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: (data: CouponFormData) => apiRequest('/api/admin/coupons', {
      method: 'POST',
      data: {
        ...data,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        discountValue: parseFloat(data.discountValue),
        minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
        validUntil: data.validUntil || null,
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons/analytics'] });
      setCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Coupon created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    },
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: ({ id, ...data }: CouponFormData & { id: number }) => 
      apiRequest(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        data: {
          ...data,
          maxUses: data.maxUses ? parseInt(data.maxUses) : null,
          discountValue: parseFloat(data.discountValue),
          minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
          validUntil: data.validUntil || null,
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setEditingCoupon(null);
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
        variant: "destructive",
      });
    },
  });

  // Deactivate coupon mutation
  const deactivateCouponMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/coupons/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      toast({
        title: "Success",
        description: "Coupon deactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate coupon",
        variant: "destructive",
      });
    },
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (data: { template: CouponFormData, count: number, prefix: string }) => 
      apiRequest('/api/admin/coupons/bulk', {
        method: 'POST',
        data: {
          template: {
            ...data.template,
            maxUses: data.template.maxUses ? parseInt(data.template.maxUses) : null,
            discountValue: parseFloat(data.template.discountValue),
            minOrderValue: data.template.minOrderValue ? parseFloat(data.template.minOrderValue) : null,
            validUntil: data.template.validUntil || null,
          },
          count: data.count,
          prefix: data.prefix,
        }
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setBulkDialogOpen(false);
      toast({
        title: "Success",
        description: `${data.coupons?.length || 0} coupons created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupons",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `Coupon code "${text}" copied to clipboard`,
    });
  };

  const CouponForm = ({ 
    initialData, 
    onSubmit, 
    isLoading: submitting 
  }: { 
    initialData?: Partial<CouponCode>, 
    onSubmit: (data: CouponFormData) => void,
    isLoading: boolean
  }) => {
    const [formData, setFormData] = useState<CouponFormData>({
      code: initialData?.code || '',
      description: initialData?.description || '',
      discountType: (initialData?.discountType as 'percentage' | 'fixed') || 'percentage',
      discountValue: initialData?.discountValue || '',
      maxUses: initialData?.maxUses?.toString() || '1',
      validFrom: initialData?.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
      minOrderValue: initialData?.minOrderValue || '',
      applicablePlans: initialData?.applicablePlans || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-coupon">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Coupon Code (optional)</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Leave blank to auto-generate"
              data-testid="input-coupon-code"
            />
          </div>
          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={formData.discountType} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}>
              <SelectTrigger data-testid="select-discount-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="discountValue">
              {formData.discountType === 'percentage' ? 'Discount %' : 'Discount Amount ($)'}
            </Label>
            <Input
              id="discountValue"
              type="number"
              step={formData.discountType === 'percentage' ? '1' : '0.01'}
              max={formData.discountType === 'percentage' ? '100' : undefined}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
              data-testid="input-discount-value"
            />
          </div>
          <div>
            <Label htmlFor="maxUses">Max Uses (blank = unlimited)</Label>
            <Input
              id="maxUses"
              type="number"
              min="1"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="1"
              data-testid="input-max-uses"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this coupon..."
            data-testid="input-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              required
              data-testid="input-valid-from"
            />
          </div>
          <div>
            <Label htmlFor="validUntil">Valid Until (optional)</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              data-testid="input-valid-until"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="minOrderValue">Minimum Order Value (optional)</Label>
          <Input
            id="minOrderValue"
            type="number"
            step="0.01"
            min="0"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
            placeholder="0.00"
            data-testid="input-min-order-value"
          />
        </div>

        <Button type="submit" disabled={submitting} data-testid="button-submit-coupon">
          {submitting ? 'Saving...' : (initialData ? 'Update Coupon' : 'Create Coupon')}
        </Button>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Coupon Management</h1>
          <p className="text-gray-600">Create and manage promotional coupon codes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-bulk-create">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Create Coupons</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkCount">Number of Coupons (max 100)</Label>
                  <Input
                    id="bulkCount"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue="10"
                    data-testid="input-bulk-count"
                  />
                </div>
                <div>
                  <Label htmlFor="bulkPrefix">Code Prefix (optional)</Label>
                  <Input
                    id="bulkPrefix"
                    placeholder="SALE"
                    data-testid="input-bulk-prefix"
                  />
                </div>
                <Button 
                  onClick={() => {
                    const countInput = document.getElementById('bulkCount') as HTMLInputElement;
                    const prefixInput = document.getElementById('bulkPrefix') as HTMLInputElement;
                    
                    const template: CouponFormData = {
                      description: 'Bulk generated coupon',
                      discountType: 'percentage',
                      discountValue: '10',
                      maxUses: '1',
                      validFrom: new Date().toISOString().split('T')[0],
                      validUntil: '',
                      minOrderValue: '',
                      applicablePlans: [],
                    };
                    
                    bulkCreateMutation.mutate({
                      template,
                      count: parseInt(countInput.value) || 10,
                      prefix: prefixInput.value || '',
                    });
                  }}
                  disabled={bulkCreateMutation.isPending}
                  data-testid="button-create-bulk"
                >
                  {bulkCreateMutation.isPending ? 'Creating...' : 'Create Coupons'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-coupon">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <CouponForm 
                onSubmit={createCouponMutation.mutate} 
                isLoading={createCouponMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {(analyticsData as any)?.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-coupons">{coupons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-usage">{(analyticsData as any).analytics.totalUsage}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Discount Given</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-total-discount">
                ${(analyticsData as any).analytics.totalDiscountGiven.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-discount">
                ${(analyticsData as any).analytics.averageDiscountPerUse.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="text-no-coupons">
              No coupons created yet. Create your first coupon to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                          data-testid={`button-copy-${coupon.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {coupon.description && (
                        <div className="text-sm text-gray-600 mt-1">{coupon.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coupon.discountType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : formatCurrency(coupon.discountValue)
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.currentUses} / {coupon.maxUses || '∞'}
                      </div>
                      {coupon.maxUses && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-valid-until-${coupon.id}`}>
                      {formatDate(coupon.validUntil)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingCoupon(coupon)} data-testid={`button-edit-${coupon.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Coupon</DialogTitle>
                            </DialogHeader>
                            {editingCoupon && (
                              <CouponForm 
                                initialData={editingCoupon}
                                onSubmit={(data) => updateCouponMutation.mutate({ id: editingCoupon.id, ...data })}
                                isLoading={updateCouponMutation.isPending}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateCouponMutation.mutate(coupon.id)}
                          disabled={!coupon.isActive}
                          data-testid={`button-deactivate-${coupon.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}