import { useState } from 'react';
import { Trash2, ShoppingCart, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Customer, GridCell, Product } from '@/types';
import { calculateLineItem, formatCurrency } from '@/utils/calculations';
import { EditCustomerDialog } from './EditCustomerDialog';

interface CustomerRowProps {
  customer: Customer;
  cells: GridCell[];
  products: Product[];
  rowHeight: number;
  orderDetails?: { group_name: string; marketer_name: string; transporter_name: string; delivery_address: string };
  customItems: Array<{ id: string; name: string; quantity: number; unitPrice: number; price: number }>;
  discount: number;
  advanceAmount: number;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
  onDiscountChange: (discount: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  onRemove: () => void;
  onEdit: (updatedCustomer: Partial<Customer>, updatedOrderDetails: any) => void;
}

export function CustomerRow({ customer, cells, products, rowHeight, orderDetails, customItems, discount, advanceAmount, isHighlighted, onToggleHighlight, onDiscountChange, onCheckout, onClear, onRemove, onEdit }: CustomerRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const calculateTotals = () => {
    let itemValue = 0;
    let gstValue = 0;

    cells.forEach(cell => {
      products.forEach(product => {
        const variant = product.variants.find(v => v.id === cell.variant_id);
        if (variant) {
          const calc = calculateLineItem(variant.price, cell.qty, product.tax_percent);
          itemValue += calc.value;
          gstValue += calc.gst;
        }
      });
    });

    // Add custom items to itemValue (base price without GST)
    const customItemsTotal = customItems.reduce((sum, item) => sum + item.price, 0);
    const customItemsGst = customItemsTotal * 0.05; // 5% GST
    const customItemsCount = customItems.length;

    itemValue += customItemsTotal;
    gstValue += customItemsGst;

    // Calculate 5% discount on item value (before GST) - matches cart logic
    const calculatedDiscount = itemValue * 0.05;

    const grandTotal = (itemValue - calculatedDiscount) + gstValue;

    return {
      itemValue,
      gstValue,
      customItemsTotal,
      customItemsCount,
      discount: calculatedDiscount,
      grandTotal,
    };
  };

  const totals = calculateTotals();
  const totalQuantity = cells.reduce((sum, cell) => sum + cell.qty, 0);
  const hasQuantity = totalQuantity > 0;

  return (
    <div className="border-b border-r pt-3 px-3 pb-4 flex flex-col" style={{ height: `${rowHeight}px` }}>
      {/* Top section - Customer Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{customer.name}</h3>
          <p className="text-xs text-muted-foreground/70 truncate mb-0.5">+91 {customer.phone}</p>
          <p className="text-xs text-muted-foreground truncate">Group: {orderDetails?.group_name || ''}</p>
          <p className="text-xs text-muted-foreground truncate">Marketer: {orderDetails?.marketer_name || ''}</p>
          <p className="text-xs text-muted-foreground truncate">Transporter: {orderDetails?.transporter_name || ''}</p>
          <p className="text-xs text-muted-foreground truncate">Delivery: {orderDetails?.delivery_address || ''}</p>
        </div>
        {hasQuantity && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 shrink-0 ${isHighlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
            onClick={onToggleHighlight}
          >
            <Sun className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-1"></div>

      {/* Bottom section - Totals and Checkout */}
      <div>
        <div className="space-y-1 text-xs mb-3">
          {totals.customItemsCount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custom Items ({totals.customItemsCount}):</span>
              <span className="font-medium">{formatCurrency(totals.customItemsTotal)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item Value:</span>
            <span className="font-medium">{formatCurrency(totals.itemValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST:</span>
            <span className="font-medium">{formatCurrency(totals.gstValue)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span className="font-medium">- {formatCurrency(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Grand Total:</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
          {advanceAmount > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Advance:</span>
                <span className="font-medium">- {formatCurrency(advanceAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Due Amount:</span>
                <span>{formatCurrency(totals.grandTotal - advanceAmount)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-9 border-destructive text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-[0.6]"
            onClick={() => setEditDialogOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-[1.4]"
            onClick={onCheckout}
          >
            <ShoppingCart className="h-3 w-3 mr-2" />
            Checkout
          </Button>
        </div>
      </div>

      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={customer}
        orderDetails={orderDetails}
        onSave={onEdit}
      />
    </div>
  );
}
