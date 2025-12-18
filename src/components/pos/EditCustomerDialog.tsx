import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OrderDetails {
  group_name?: string;
  marketer_name?: string;
  transporter_name?: string;
  delivery_address?: string;
}

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  orderDetails?: OrderDetails;
  onSave: (updatedCustomer: Partial<Customer>, updatedOrderDetails: OrderDetails) => void;
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  orderDetails,
  onSave,
}: EditCustomerDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: customer.name,
    delivery_address: customer.delivery_address || '',
    billing_address: customer.billing_address || '',
    gst_number: customer.gst_number || '',
  });

  const [orderFormData, setOrderFormData] = useState({
    group_name: orderDetails?.group_name || '',
    marketer_name: orderDetails?.marketer_name || '',
    transporter_name: orderDetails?.transporter_name || '',
    delivery_address: orderDetails?.delivery_address || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    onSave(formData, orderFormData);
    toast({
      title: "Success",
      description: "Customer information updated",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Customer Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Customer Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customer.phone}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Phone number cannot be changed</p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Textarea
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Enter delivery address"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="Enter billing address"
                  rows={2}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="gst_number">GST Number</Label>
                <Input
                  id="gst_number"
                  value={formData.gst_number}
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Order Specific Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group_name">Group Name</Label>
                <Input
                  id="group_name"
                  value={orderFormData.group_name}
                  onChange={(e) => setOrderFormData({ ...orderFormData, group_name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <Label htmlFor="marketer_name">Marketer Name</Label>
                <Input
                  id="marketer_name"
                  value={orderFormData.marketer_name}
                  onChange={(e) => setOrderFormData({ ...orderFormData, marketer_name: e.target.value })}
                  placeholder="Enter marketer name"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="transporter_name">Transporter Name</Label>
                <Input
                  id="transporter_name"
                  value={orderFormData.transporter_name}
                  onChange={(e) => setOrderFormData({ ...orderFormData, transporter_name: e.target.value })}
                  placeholder="Enter transporter name"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="order_delivery_address">Delivery</Label>
                <Input
                  id="order_delivery_address"
                  value={orderFormData.delivery_address}
                  onChange={(e) => setOrderFormData({ ...orderFormData, delivery_address: e.target.value })}
                  placeholder="Enter delivery location"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
