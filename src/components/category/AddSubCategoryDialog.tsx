import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialData?: any;
  onSubmit: (data: any) => void;
  isEdit?: boolean;
}

export function AddSubCategoryDialog({ open, onOpenChange, mode, initialData, onSubmit, isEdit}: AddSubCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    priority: 100,
  });
  const [error, setError] = useState<string>("");


  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        priority: initialData.priority,
      });
    }
    else {
      setFormData({
        name: "",
        priority: 100
      });
    }
  }, [mode, initialData]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError("SubCategory name is required");
      return;
    }

    setError("");

    onSubmit({
      ...formData,
      subCategoryId: initialData?._id,
    });
    setFormData({ name: "", priority: 100 });
    onOpenChange(false);

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
              SubCategory Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter subcategory name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (error) setError("");
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">
              Priority<span className="text-destructive">*</span>(1 Highest)
            </Label>
            <Input
              id="priority"
              placeholder="Enter priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value), })}
            />

          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-black/90"
            size="lg"
          >
            {
              isEdit ? (
                <span>Edit Sub Category</span>
              ) : (
                <span>Add Sub Category</span>
              )
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
