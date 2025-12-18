import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditCustomerModalProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: Customer) => void;
}

export const EditCustomerModal = ({
  customer,
  open,
  onOpenChange,
  onSave,
}: EditCustomerModalProps) => {
  const [formData, setFormData] = useState<Customer>(customer);

  useEffect(() => {
    setFormData(customer);
  }, [customer]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              value={formData.gst_number || ''}
              onChange={(e) =>
                setFormData({ ...formData, gst_number: e.target.value })
              }
              placeholder="GST Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Select
              value={formData.tag || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, tag: value as 'Silver' | 'Gold' | 'VIP' })
              }
            >
              <SelectTrigger id="tag">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_address">Delivery Address</Label>
            <Textarea
              id="delivery_address"
              value={formData.delivery_address || ''}
              onChange={(e) =>
                setFormData({ ...formData, delivery_address: e.target.value })
              }
              placeholder="Delivery address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_address">Billing Address</Label>
            <Textarea
              id="billing_address"
              value={formData.billing_address || ''}
              onChange={(e) =>
                setFormData({ ...formData, billing_address: e.target.value })
              }
              placeholder="Billing address"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
