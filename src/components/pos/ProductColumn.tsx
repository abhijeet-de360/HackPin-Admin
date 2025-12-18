import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/pos/QuantityInput";
import { Product, Customer } from "@/types";
import { formatCurrency, calculateLineItem } from "@/utils/calculations";
import { cn } from "@/lib/utils";

interface ProductColumnProps {
  product: Product;
  customers: Customer[];
  selectedCustomers: string[];
  calculateRowHeight: (customerId: string) => number;
  highlightedCustomers: Set<string>;
  getQuantity: (customerId: string, variantId: string) => number;
  onQuantityChange: (customerId: string, variantId: string, qty: number) => void;
  onRemove: () => void;
}
export function ProductColumn({
  product,
  customers,
  selectedCustomers,
  calculateRowHeight,
  highlightedCustomers,
  getQuantity,
  onQuantityChange,
  onRemove
}: ProductColumnProps) {
  // Calculate available stock for each variant (original stock - total used across all customers)
  const getAvailableStock = (variantId: string, originalStock: number) => {
    let totalUsed = 0;
    customers.forEach(customer => {
      totalUsed += getQuantity(customer.id, variantId);
    });
    return originalStock - totalUsed;
  };

  // Calculate totals for a specific customer and this product
  const calculateCustomerProductTotals = (customerId: string) => {
    let totalQty = 0;
    let totalAmount = 0;
    product.variants.forEach(variant => {
      const qty = getQuantity(customerId, variant.id);
      if (qty > 0) {
        totalQty += qty;
        const calc = calculateLineItem(variant.price, qty, product.tax_percent);
        totalAmount += calc.total;
      }
    });
    return {
      totalQty,
      totalAmount
    };
  };

  // Get variant count summary for header
  const getVariantSummary = () => {
    const variantCounts: {
      [key: string]: number;
    } = {};
    product.variants.forEach(variant => {
      let count = 0;
      customers.forEach(customer => {
        count += getQuantity(customer.id, variant.id);
      });
      if (count > 0) {
        variantCounts[variant.label] = count;
      }
    });
    return Object.entries(variantCounts).map(([label, count]) => `${count} ${label}`).join(" + ");
  };


  return <div className="min-w-[260px] flex-none">
      {/* Product Header */}
      <div className="border-b border-r pl-2 pr-2 py-2 bg-background sticky top-0 z-10 h-16 flex flex-col justify-center">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <p className="truncate text-base mb-1">
              <span className="font-semibold">{product.design_id}</span> - {product.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{product.description || ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-4 w-4 shrink-0 mr-1 ">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* For each customer, show all variants + customer totals for this product */}
      {customers.map(customer => {
      const customerTotals = calculateCustomerProductTotals(customer.id);
      const rowHeight = calculateRowHeight(customer.id);
      return <div key={customer.id} style={{
        height: `${rowHeight}px`
      }} className="border-b border-r pt-3 px-3 pb-4 flex flex-col">
            {/* Variant rows for this customer */}
            {product.variants.map(variant => {
          const currentQty = getQuantity(customer.id, variant.id);
          const availableStock = getAvailableStock(variant.id, variant.stock_qty);
          const maxAllowed = availableStock + currentQty; // Customer can keep what they have + what's available
          const isHighlighted = highlightedCustomers.has(customer.id) && currentQty > 0;
          return <div 
                  key={`${customer.id}-${variant.id}`} 
                  className={cn(
                    "h-10 flex items-center justify-between gap-2 transition-colors duration-200",
                    isHighlighted && "bg-yellow-50 dark:bg-yellow-950/20 border-l-2 border-yellow-400 dark:border-yellow-600 -ml-3 pl-3"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-extralight text-sm">
                      <span className="font-normal text-foreground">{variant.label}</span> -{" "}
                      <span className={`font-semibold ${availableStock === 0 ? "text-destructive" : availableStock <= 50 ? "text-warning" : "text-success"}`}>
                        {availableStock} pcs
                      </span>
                    </p>
                    <p className="text-xs truncate">{formatCurrency(variant.price)}</p>
                  </div>
                  <QuantityInput value={currentQty} onChange={qty => onQuantityChange(customer.id, variant.id, qty)} max={maxAllowed} />
                </div>;
        })}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Separator */}
            <div className="border-t mb-1 mt-1 mx-0"></div>

            {/* Customer totals for this product */}
            <div className="bg-muted/10 -mx-0 px-0 pt-0 pb-0 text-xs space-y-0 ">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="font-semibold">{customerTotals.totalQty} pcs</span>
              </div>
              <div className="flex justify-between mb-0.5 ">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold text-primary">{formatCurrency(customerTotals.totalAmount)}</span>
              </div>
            </div>
          </div>;
    })}
    </div>;
}