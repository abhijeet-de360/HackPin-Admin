import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { TeamMember } from "@/types";

interface EditPOSStaffModalProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: TeamMember) => void;
}

export const EditPOSStaffModal = ({ member, open, onOpenChange, onSave }: EditPOSStaffModalProps) => {
  const [formData, setFormData] = useState<TeamMember>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "active" as 'active' | 'inactive' | 'deleted'
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Edit POS Staff Member</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter role"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'deleted') => setFormData({ ...formData, status: value })}
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
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
