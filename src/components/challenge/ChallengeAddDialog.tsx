import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/types";
import { z } from "zod";

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: (member: TeamMember) => void;
}

const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(10, "Valid phone number is required").max(15),
  role: z.string().trim().min(1, "Role is required").max(100),
  department: z.string().trim().max(100).optional(),
  status: z.enum(["active", "inactive", "deleted"]),
});

export function ChallengeAddDialog({
  open,
  onOpenChange,
  onAddNew,
}: AddTeamDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = () => {
    try {
      const validated = teamMemberSchema.parse(formData);
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        role: validated.role,
        department: validated.department,
        status: validated.status,
      };

      onAddNew(newMember);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        category: "active",
        startDate: "",
        endDate: "",
      });
      setErrors({});
      onOpenChange(false);

      toast({
        title: "Team member added",
        description: `${newMember.name} has been added successfully`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
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
            <h2 className="text-lg font-semibold">Back to List</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Challenge name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Post type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image post</SelectItem>
                  <SelectItem value="video">Vidoe post </SelectItem>
                  <SelectItem value="reel">Reel post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Winner by <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select winner by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Most view</SelectItem>
                  <SelectItem value="like">Most Like</SelectItem>
                  <SelectItem value="comment">Most Comment</SelectItem>
                  <SelectItem value="share">Most share</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div> */}
            {/* <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
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
            </div> */}
          </div>

          {/* <div className="space-y-3">
          <Label>Access Permissions</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-admin" 
                checked={formData.permissions.admin}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, admin: checked === true}
                })}
              />
              <label htmlFor="add-admin" className="text-sm cursor-pointer font-medium">Admin (Full Access)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-products" 
                checked={formData.permissions.products}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, products: checked === true}
                })}
              />
              <label htmlFor="add-products" className="text-sm cursor-pointer">User</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-products" 
                checked={formData.permissions.products}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, products: checked === true}
                })}
              />
              <label htmlFor="add-products" className="text-sm cursor-pointer">Post</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-customers" 
                checked={formData.permissions.customers}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, customers: checked === true}
                })}
              />
              <label htmlFor="add-customers" className="text-sm cursor-pointer">Reel</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-onlineOrders" 
                checked={formData.permissions.onlineOrders}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, onlineOrders: checked === true}
                })}
              />
              <label htmlFor="add-onlineOrders" className="text-sm cursor-pointer">Challenge</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-posOrders" 
                checked={formData.permissions.posOrders}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, posOrders: checked === true}
                })}
              />
              <label htmlFor="add-posOrders" className="text-sm cursor-pointer">Team</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-paymentManagement" 
                checked={formData.permissions.paymentManagement}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, paymentManagement: checked === true}
                })}
              />
              <label htmlFor="add-paymentManagement" className="text-sm cursor-pointer">Category</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-imageViewRequests" 
                checked={formData.permissions.imageViewRequests}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, imageViewRequests: checked === true}
                })}
              />
              <label htmlFor="add-imageViewRequests" className="text-sm cursor-pointer">Image View Requests</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-appAccess" 
                checked={formData.permissions.appAccess}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, appAccess: checked === true}
                })}
              />
              <label htmlFor="add-appAccess" className="text-sm cursor-pointer">App Access</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-hr" 
                checked={formData.permissions.hr}
                onCheckedChange={(checked) => setFormData({
                  ...formData, 
                  permissions: {...formData.permissions, hr: checked === true}
                })}
              />
              <label htmlFor="add-hr" className="text-sm cursor-pointer">HR (Add Team)</label>
            </div>
          </div>
        </div> */}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Challenge</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
