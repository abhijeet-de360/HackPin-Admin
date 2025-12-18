import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/types';
import { z } from 'zod';

interface AddPOSStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: (member: TeamMember) => void;
}

const staffMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(10, "Valid phone number is required").max(15),
  role: z.string().trim().min(1, "Role is required").max(100),
  department: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'inactive', 'deleted'])
});

export function AddPOSStaffDialog({
  open,
  onOpenChange,
  onAddNew
}: AddPOSStaffDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active' as 'active' | 'inactive' | 'deleted',
    permissions: {
      products: false,
      customers: false,
      onlineOrders: false,
      posOrders: false,
      paymentManagement: false,
      imageViewRequests: false,
      appAccess: false,
      hr: false,
      admin: false
    }
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
      const validated = staffMemberSchema.parse(formData);
      const newMember: TeamMember = {
        id: `pos-staff-${Date.now()}`,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        role: validated.role,
        department: validated.department,
        status: validated.status,
        permissions: formData.permissions
      };

      onAddNew(newMember);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'active',
        permissions: {
          products: false,
          customers: false,
          onlineOrders: false,
          posOrders: false,
          paymentManagement: false,
          imageViewRequests: false,
          appAccess: false,
          hr: false,
          admin: false
        }
      });
      setErrors({});
      onOpenChange(false);

      toast({
        title: "POS staff member added",
        description: `${newMember.name} has been added successfully`,
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
      <DialogContent className="max-w-2xl">
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
            <h2 className="text-lg font-semibold">Add New POS Staff Member</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="Enter role"
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'deleted') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add POS Staff Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
