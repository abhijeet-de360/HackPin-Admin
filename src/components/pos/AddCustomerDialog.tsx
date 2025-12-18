import { useState, useMemo } from 'react';
import { Search, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Customer, Order } from '@/types';
import { z } from 'zod';
import ordersData from '@/data/orders.json';
import { formatCurrency } from '@/utils/calculations';
interface OrderDetails {
  group_name: string;
  marketer_name: string;
  transporter_name: string;
  delivery_address: string;
}
interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  selectedCustomers: string[];
  onSelect: (customerId: string, orderDetails?: OrderDetails) => void;
  onAddNew: (customer: Customer) => void;
}
const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(100),
  phone: z.string().trim().min(10, "Valid phone number is required").max(15),
  delivery_address: z.string().trim().max(500).optional(),
  billing_address: z.string().trim().max(500).optional(),
  gst_number: z.string().trim().max(15).optional()
});
export function AddCustomerDialog({
  open,
  onOpenChange,
  customers,
  selectedCustomers,
  onSelect,
  onAddNew
}: AddCustomerDialogProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    delivery_address: '',
    billing_address: '',
    gst_number: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    toast
  } = useToast();
  const filteredCustomers = customers.filter(customer => !selectedCustomers.includes(customer.id) && (customer.name.toLowerCase().includes(search.toLowerCase()) || customer.phone.includes(search)));

  // Calculate payment dues for each customer
  const customerDues = useMemo(() => {
    const orders = ordersData as Order[];
    const duesMap = new Map<string, {
      count: number;
      total: number;
    }>();
    orders.forEach(order => {
      const dueAmount = order.grand_total - order.advance_amount;
      if (dueAmount > 0) {
        const existing = duesMap.get(order.customer_id) || {
          count: 0,
          total: 0
        };
        duesMap.set(order.customer_id, {
          count: existing.count + 1,
          total: existing.total + dueAmount
        });
      }
    });
    return duesMap;
  }, []);
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
  const handleCustomerSelect = (customer: Customer) => {
    onSelect(customer.id);
    setSearch('');
    onOpenChange(false);
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

      // Add customer
      onAddNew(newCustomer);

      // Select/add to POS immediately
      onSelect(newCustomer.id);

      // Reset form and state
      setFormData({
        name: '',
        phone: '',
        delivery_address: '',
        billing_address: '',
        gst_number: ''
      });
      setErrors({});
      setShowForm(false);
      setSearch('');

      // Close dialog
      onOpenChange(false);
      toast({
        title: "Customer added to POS",
        description: "New customer has been created and added to the order."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" hideClose>
        <div className="space-y-4">
          {/* Search + Plus Button - Only show when form is hidden */}
          {!showForm && <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
              </div>
              <Button onClick={() => setShowForm(true)} className="h-10 w-10 p-0 bg-black hover:bg-black/90" size="icon">
                <Plus className="h-5 w-5 text-white" />
              </Button>
            </div>}

          {/* Conditional Content */}
          {!showForm ?
        // Customer List
        <div className="max-h-[450px] overflow-y-auto space-y-1.5">
              {filteredCustomers.map(customer => {
            const dues = customerDues.get(customer.id);
            return <button key={customer.id} className="w-full text-left p-2 rounded-lg border transition-colors hover:bg-muted hover:border-primary" onClick={() => handleCustomerSelect(customer)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{customer.name}</p>
                        <p className="text-xs opacity-80">{customer.phone}</p>
                      </div>
                      {dues && <div className="flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
                          <div className="font-semibold">{dues.count} {dues.count === 1 ? 'order' : 'orders'} due</div>
                        </div>}
                    </div>
                  </button>;
          })}
            </div> :
        // New Customer Form
        <div className="space-y-4">
              <Button variant="ghost" onClick={() => setShowForm(false)} className="p-0 h-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Enter customer name" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Enter mobile number" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input id="gst_number" value={formData.gst_number} onChange={e => handleInputChange('gst_number', e.target.value)} placeholder="Enter GST number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_address">Delivery Address</Label>
                <Textarea id="delivery_address" value={formData.delivery_address} onChange={e => handleInputChange('delivery_address', e.target.value)} placeholder="Enter delivery address" rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_address">Billing Address</Label>
                <Textarea id="billing_address" value={formData.billing_address} onChange={e => handleInputChange('billing_address', e.target.value)} placeholder="Enter billing address" rows={2} />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
}