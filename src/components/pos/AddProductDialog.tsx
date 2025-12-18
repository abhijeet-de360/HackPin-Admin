import { useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  selectedProducts: string[];
  onSelect: (productId: string) => void;
}

export function AddProductDialog({ open, onOpenChange, products, selectedProducts, onSelect }: AddProductDialogProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(product =>
    !selectedProducts.includes(product.id) &&
    product.active &&
    (product.name.toLowerCase().includes(search.toLowerCase()) ||
     product.hsn.includes(search) ||
     product.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()) || v.barcode.includes(search)))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" hideClose>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                onClick={() => onSelect(product.id)}
              >
                <p className="text-sm">
                  <span className="font-semibold">{product.design_id}</span> - {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.variants.length} variants | GST: 5%
                </p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
