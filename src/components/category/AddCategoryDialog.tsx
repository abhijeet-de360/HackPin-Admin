import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types';
import { z } from 'zod';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: (customer: Customer) => void;
}

const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number is required").max(15),
  delivery_address: z.string().trim().max(500).optional(),
  billing_address: z.string().trim().max(500).optional(),
  gst_number: z.string().trim().max(15).optional()
});

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAddNew
}: AddCustomerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = () => {
    try {
      const validated = customerSchema.parse(formData);
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        name: validated.name,
        phone: validated.phone,
        delivery_address: validated.delivery_address,
        billing_address: validated.billing_address,
        gst_number: validated.gst_number
      };

      onAddNew(newCustomer);

      // Reset form
      setFormData({
        name: '',
 
      });
      setErrors({});
      onOpenChange(false);

      toast({
        title: "Customer added",
        description: `${newCustomer.name} has been added successfully`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">Back to List</h2>
          </div>

 
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="phone">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="Enter mobile number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div> */}
   

          {/* <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              placeholder="Enter GST number"
              value={formData.gst_number}
              onChange={(e) => handleInputChange('gst_number', e.target.value)}
              className={errors.gst_number ? 'border-destructive' : ''}
            />
            {errors.gst_number && (
              <p className="text-sm text-destructive">{errors.gst_number}</p>
            )}
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="delivery_address">Delivery Address</Label>
            <Textarea
              id="delivery_address"
              placeholder="Enter delivery address"
              value={formData.delivery_address}
              onChange={(e) => handleInputChange('delivery_address', e.target.value)}
              className={errors.delivery_address ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.delivery_address && (
              <p className="text-sm text-destructive">{errors.delivery_address}</p>
            )}
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="billing_address">Billing Address</Label>
            <Textarea
              id="billing_address"
              placeholder="Enter billing address"
              value={formData.billing_address}
              onChange={(e) => handleInputChange('billing_address', e.target.value)}
              className={errors.billing_address ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.billing_address && (
              <p className="text-sm text-destructive">{errors.billing_address}</p>
            )}
          </div> */}

          <Button 
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-black/90"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
