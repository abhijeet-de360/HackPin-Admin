import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/UserMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import productsData from "@/data/products.json";
import { Product } from "@/types";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const products = productsData as Product[];

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.design_id.toLowerCase().includes(query) ||
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        if (displayCount < filteredProducts.length) {
          setDisplayCount((prev) =>
            Math.min(prev + 50, filteredProducts.length)
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredProducts.length]);

  // Display products based on scroll position
  const visibleProducts = filteredProducts.slice(0, displayCount);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  const handleDeleteProducts = () => {
    // In a real app, this would delete products from the database
    toast({
      title: "Products deleted",
      description: `${selectedProducts.length} product(s) have been deleted successfully`,
    });
    setSelectedProducts([]);
    setShowDeleteDialog(false);
  };

  const getQuantityColor = (qty: number) => {
    if (qty === 0) return "text-red-600";
    if (qty < 50) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Products</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedProducts.length > 0 && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={() => navigate("/products/new")}>
              <Plus className="h-4 w-4" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center">
                    <Checkbox
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-32">Design ID</TableHead>
                <TableHead className="w-48">Details</TableHead>
                <TableHead className="w-40">Collection Name</TableHead>
                <TableHead>Variants and Stock</TableHead>
                <TableHead className="w-24 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.design_id}
                    </Button>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description || product.name}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <span key={variant.id} className="text-sm">
                          <span className="text-black">{variant.label}:</span>{" "}
                          <span className={getQuantityColor(variant.stock_qty)}>
                            {variant.stock_qty}
                          </span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.active ? "Active" : "Inactive"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Infinite Scroll Indicator */}
          {displayCount < filteredProducts.length && (
            <div className="text-center py-4 text-sm text-muted-foreground border-t">
              Showing {displayCount} of {filteredProducts.length} products •
              Scroll for more
            </div>
          )}
          {displayCount >= filteredProducts.length &&
            filteredProducts.length > 50 && (
              <div className="text-center py-4 text-sm text-muted-foreground border-t">
                Showing all {filteredProducts.length} products
              </div>
            )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedProducts.length} selected
              product(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProducts}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
