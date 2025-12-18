import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Copy,
  Save,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import productsData from "@/data/products.json";
import { Product, ProductVariant } from "@/types";
import imageCompression from "browser-image-compression";
import { DropzoneMulti } from "@/components/dropzone/DropzoneMulti";

const defaultVariantLabels = ["3XL", "2XL", "XL", "L", "M", "S"];

const ProductDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const isNewProduct = productId === "new";

  const [designId, setDesignId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [hsn, setHsn] = useState("");
  const [taxPercent, setTaxPercent] = useState("5");
  const [active, setActive] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "Cotton Fabric",
    "Silk Collection",
    "Wool Blend",
    "Synthetic Fabric",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [formData, setFormData] = useState({
    images: [] as any[],
    existingImages: [] as string[],
  });

  // Extract unique labels from products
  const [labels, setLabels] = useState<string[]>(() => {
    const allLabels = new Set<string>();
    (productsData as Product[]).forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.label) allLabels.add(variant.label);
      });
    });
    return Array.from(allLabels).sort();
  });
  const [newLabel, setNewLabel] = useState("");
  const [showAddLabel, setShowAddLabel] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialData, setInitialData] = useState<{
    designId: string;
    title: string;
    category: string;
    description: string;
    hsn: string;
    taxPercent: string;
    active: boolean;
    variants: ProductVariant[];
  } | null>(null);

  useEffect(() => {
    if (!isNewProduct && productId) {
      const product = (productsData as Product[]).find(
        (p) => p.id === productId
      );
      if (product) {
        const data = {
          designId: product.design_id,
          title: product.name,
          category: product.name,
          description: product.description || "",
          hsn: product.hsn,
          taxPercent: product.tax_percent.toString(),
          active: product.active,
          variants: product.variants,
        };

        setDesignId(data.designId);
        setTitle(data.title);
        setCategory(data.category);
        setDescription(data.description);
        setHsn(data.hsn);
        setTaxPercent(data.taxPercent);
        setActive(data.active);
        setVariants(data.variants);
        setInitialData(data);
        setIsLoaded(true);
        setHasChanges(false);
      }
    } else {
      // Check if we're duplicating a product
      const duplicateData = (location.state as any)?.duplicateData;

      if (duplicateData) {
        // Load duplicate data but keep designId blank
        setTitle(duplicateData.title);
        setCategory(duplicateData.category);
        setDescription(duplicateData.description);
        setHsn(duplicateData.hsn);
        setTaxPercent(duplicateData.taxPercent);
        setActive(duplicateData.active);
        setVariants(duplicateData.variants);
        setDesignId(""); // Keep design ID blank
      } else {
        // Initialize with default variants for new product
        const defaultVars = defaultVariantLabels.map((label, index) => ({
          id: `var-${index}`,
          label,
          sku: "",
          barcode: "",
          price: 0,
          stock_qty: 0,
        }));
        setVariants(defaultVars);
      }
      setIsLoaded(true);
    }
  }, [productId, isNewProduct, location.state]);

  // Check for changes
  useEffect(() => {
    if (!isLoaded) return;

    if (!isNewProduct && initialData) {
      const hasChanged =
        designId !== initialData.designId ||
        title !== initialData.title ||
        category !== initialData.category ||
        description !== initialData.description ||
        hsn !== initialData.hsn ||
        taxPercent !== initialData.taxPercent ||
        active !== initialData.active ||
        JSON.stringify(variants) !== JSON.stringify(initialData.variants);

      setHasChanges(hasChanged);
    } else if (isNewProduct) {
      // For new products, show save if any field is filled
      const hasContent =
        designId !== "" ||
        title !== "" ||
        category !== "" ||
        description !== "" ||
        hsn !== "" ||
        variants.some(
          (v) => v.label || v.sku || v.barcode || v.price > 0 || v.stock_qty > 0
        );

      setHasChanges(hasContent);
    }
  }, [
    designId,
    title,
    category,
    description,
    hsn,
    taxPercent,
    active,
    variants,
    isNewProduct,
    initialData,
    isLoaded,
  ]);

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      label: "",
      sku: designId || "",
      barcode: "",
      price: 0,
      stock_qty: 0,
    };
    setVariants([...variants, newVariant]);
  };

  const handleDeleteVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const handleVariantChange = (
    variantId: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v) => {
        if (v.id === variantId) {
          if (field === "sku") {
            // Enforce SKU pattern: {DesignID}-{CustomPart}
            const skuValue = value as string;
            if (!designId) return { ...v, sku: skuValue };

            // If user tries to modify, ensure Design ID stays intact
            if (!skuValue.startsWith(designId)) {
              // Extract custom part if it exists
              const parts = skuValue.split("-");
              const customPart =
                parts.length > 1 ? parts.slice(1).join("-") : parts[0];
              return {
                ...v,
                sku: designId + (customPart ? "-" + customPart : ""),
              };
            }
            return { ...v, sku: skuValue };
          }
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  // Update all SKUs when Design ID changes
  useEffect(() => {
    if (designId) {
      setVariants((prevVariants) =>
        prevVariants.map((v) => {
          // Extract custom part from existing SKU
          const parts = v.sku.split("-");
          const customPart = parts.length > 1 ? parts.slice(1).join("-") : "";
          // Update SKU with new Design ID but keep custom part
          return { ...v, sku: designId + (customPart ? "-" + customPart : "") };
        })
      );
    }
  }, [designId]);

  const handleSave = () => {
    if (!designId || !title || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const hasEmptyVariants = variants.some(
      (v) => !v.label || !v.sku || v.price === 0
    );
    if (hasEmptyVariants) {
      toast.error("Please complete all variant details");
      return;
    }

    toast.success(
      isNewProduct
        ? "Product created successfully"
        : "Product updated successfully"
    );
    navigate("/products");
  };

  const handleDuplicate = () => {
    toast.success("Product duplicated");
    navigate("/products/new", {
      state: {
        duplicateData: {
          title,
          category,
          description,
          hsn,
          taxPercent,
          active,
          variants,
        },
      },
    });
  };

  const handleDelete = () => {
    toast.success("Product deleted");
    navigate("/products");
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory("");
      setShowAddCategory(false);
      toast.success("Category added");
    }
  };

  const handleAddLabel = (variantId: string) => {
    if (newLabel.trim()) {
      const trimmedLabel = newLabel.trim();
      // Case-insensitive check for duplicates
      if (
        labels.some(
          (label) => label.toLowerCase() === trimmedLabel.toLowerCase()
        )
      ) {
        toast.error("This label already exists");
        return;
      }
      setLabels([...labels, trimmedLabel].sort());
      handleVariantChange(variantId, "label", trimmedLabel);
      setNewLabel("");
      setShowAddLabel({ ...showAddLabel, [variantId]: false });
      toast.success("Label added");
    }
  };

  // Validate image dimensions via HTMLImageElement
  const validateDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width > 512 || img.height > 512) {
          reject(`Image exceeds 512x512px`);
        } else {
          resolve(true);
        }
      };

      img.onerror = () => reject("Invalid image file");
    });
  };

  const compressImages = async (files) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 768,
      useWebWorker: true,
    };

    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        const compressedBlob = await imageCompression(file, options);
        return new File([compressedBlob], file.name, { type: file.type });
      })
    );

    return compressedFiles;
  };

  const handleSetImages = async (files) => {
    try {
      for (const file of files) {
        // ---- 1. Validate dimensions ----
        await validateDimensions(file);

        // ---- 2. Validate size (<= 500KB) ----
        if (file.size > 500 * 1024) {
          toast.error(`Image ${file.name} must be ≤ 500KB`);
          return;
        }
      }

      // ---- 3. Compress images ----
      const compressedFiles = await compressImages(files);

      // ---- 4. Update formData ----
      setFormData((prev) => ({
        ...prev,
        images: compressedFiles,
      }));
    } catch (err) {
      toast.error(err.toString());
    }
  };

  const handleRemoveImage = () => {};

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/products")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNewProduct ? "New Product" : designId}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNewProduct && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  className="border"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDuplicate}
                  className="border"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </>
            )}
            {hasChanges && (
              <Button size="icon" onClick={handleSave} className="border">
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 pb-6 max-w-7xl mx-auto pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Products Photos</Label>
                  <DropzoneMulti
                    images={formData.images}
                    setImages={handleSetImages}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add up to 5 photos showcasing your work. First photo will be
                    your main image.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.existingImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg flex items-center justify-center hover:border-primary cursor-pointer relative"
                      >
                        <img
                          src={image}
                          alt={`Service Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                          className="cross bg-red-500 text-white rounded-full absolute top-1 right-1 cursor-pointer"
                          onClick={() => handleRemoveImage(image)}
                        >
                          <X className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36 pl-[5px] ml-[5px]">
                        Label
                      </TableHead>
                      <TableHead className="pl-[5px] w-96">SKU</TableHead>
                      <TableHead className="pl-[5px] w-52">Barcode</TableHead>
                      <TableHead className="pl-[5px] w-52">Min</TableHead>
                      <TableHead className="w-32 pl-[5px]">Price (₹)</TableHead>
                      <TableHead className="w-28 pl-[5px]">Stock</TableHead>
                      <TableHead className="w-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="p-0">
                          <Select
                            value={variant.label}
                            onValueChange={(value) => {
                              if (value === "__add_new__") {
                                setShowAddLabel({
                                  ...showAddLabel,
                                  [variant.id]: true,
                                });
                              } else {
                                handleVariantChange(variant.id, "label", value);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 border-0 shadow-none pl-[5px] ml-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-none bg-transparent [&>svg]:hidden">
                              <div className="flex items-center gap-1">
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                <SelectValue placeholder="Select label" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {labels
                                .filter((label) => {
                                  // Show the label if it's the current variant's label or if it's not used by any other variant (case-insensitive)
                                  const isCurrentLabel =
                                    label.toLowerCase() ===
                                    variant.label.toLowerCase();
                                  const isUsedByOther = variants.some(
                                    (v) =>
                                      v.id !== variant.id &&
                                      v.label.toLowerCase() ===
                                        label.toLowerCase()
                                  );
                                  return isCurrentLabel || !isUsedByOther;
                                })
                                .map((label) => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              <Separator className="my-1" />
                              <div className="p-2 flex justify-end">
                                {showAddLabel[variant.id] ? (
                                  <div className="flex gap-2">
                                    <Input
                                      value={newLabel}
                                      onChange={(e) =>
                                        setNewLabel(e.target.value)
                                      }
                                      placeholder="Label name"
                                      className="h-8"
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter")
                                          handleAddLabel(variant.id);
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddLabel(variant.id)}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 bg-black text-white hover:bg-black/90 border-black"
                                    onClick={() =>
                                      setShowAddLabel({
                                        ...showAddLabel,
                                        [variant.id]: true,
                                      })
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-0">
                          <Input
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "sku",
                                e.target.value
                              )
                            }
                            placeholder="SKU"
                            className="h-8 border-0 shadow-none pl-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-none bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <Input
                            value={variant.barcode}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "barcode",
                                e.target.value
                              )
                            }
                            placeholder="Barcode"
                            className="h-8 border-0 shadow-none pl-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-none bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <Input
                            value={variant.barcode}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "barcode",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className="h-8 border-0 shadow-none pl-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-none bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="h-8 border-0 shadow-none pl-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-none bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="p-0">
                          <Input
                            type="number"
                            value={variant.stock_qty}
                            onChange={(e) =>
                              handleVariantChange(
                                variant.id,
                                "stock_qty",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="h-8 border-0 shadow-none pl-[5px] pr-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-20 rounded-none bg-transparent"
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            ×
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t flex justify-end">
                  <Button size="sm" onClick={handleAddVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="designId">Design ID *</Label>
                  <Input
                    id="designId"
                    value={designId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                      setDesignId(value);
                    }}
                    placeholder="Enter design ID"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <Separator className="my-1" />
                      <div className="p-2">
                        {showAddCategory ? (
                          <div className="flex gap-2">
                            <Input
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Category name"
                              className="h-8"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") handleAddCategory();
                              }}
                            />
                            <Button size="sm" onClick={handleAddCategory}>
                              Add
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setShowAddCategory(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                          </Button>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hsn">HSN Code</Label>
                  <Input
                    id="hsn"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    placeholder="Enter HSN code"
                  />
                </div>

                <div>
                  <Label htmlFor="tax">Tax Percent</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={active ? "active" : "inactive"}
                    onValueChange={(value) => setActive(value === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
