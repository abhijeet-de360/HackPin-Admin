import { useState } from 'react';
import { Printer, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Customer, GridCell, Product, PaymentStatus, Order, OrderItem } from '@/types';
import { calculateLineItem, calculateOrderTotals, formatCurrency, generateOrderNumber } from '@/utils/calculations';
import { toast } from 'sonner';
interface CheckoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  cells: GridCell[];
  products: Product[];
  orderDetails?: {
    group_name: string;
    marketer_name: string;
    transporter_name: string;
    delivery_address: string;
  };
  customItems: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }>;
  onCustomItemsChange: (items: Array<{ id: string; name: string; quantity: number; unitPrice: number; price: number }>) => void;
  advanceAmount: string;
  onAdvanceAmountChange: (amount: string) => void;
  onOrderCreated: () => void;
}
export function CheckoutDrawer({
  open,
  onOpenChange,
  customer,
  cells,
  products,
  orderDetails,
  customItems,
  onCustomItemsChange,
  advanceAmount,
  onAdvanceAmountChange,
  onOrderCreated
}: CheckoutDrawerProps) {
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [newCustomItemQuantity, setNewCustomItemQuantity] = useState('1');
  const [newCustomItemPrice, setNewCustomItemPrice] = useState('');
  const calculateItems = (): OrderItem[] => {
    const items: OrderItem[] = [];
    cells.forEach(cell => {
      products.forEach(product => {
        const variant = product.variants.find(v => v.id === cell.variant_id);
        if (variant) {
          const calc = calculateLineItem(variant.price, cell.qty, product.tax_percent);
          items.push({
            id: `item-${Date.now()}-${Math.random()}`,
            variant_id: variant.id,
            product_name: product.name,
            design_id: product.design_id,
            variant_label: variant.label,
            price: variant.price,
            qty: cell.qty,
            tax_percent: product.tax_percent,
            value: calc.value,
            gst: calc.gst,
            total: calc.total
          });
        }
      });
    });
    return items;
  };
  const items = calculateItems();

  // Convert custom items to OrderItem format
  const customOrderItems: OrderItem[] = customItems.map(item => {
    const gst = item.price * 5 / 100;
    const total = item.price + gst;
    return {
      id: item.id,
      variant_id: 'custom',
      product_name: item.name,
      design_id: '',
      variant_label: '',
      price: item.price,
      qty: 1,
      tax_percent: 5,
      value: item.price,
      gst: Math.round(gst * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  });
  const allItems = [...items, ...customOrderItems];
  const totals = calculateOrderTotals(allItems);
  const grandTotal = totals.item_value * 0.95 + totals.gst_value;
  const advanceValue = parseFloat(advanceAmount) || 0;
  const isAdvanceValid = advanceValue <= grandTotal;
  const handleCreateOrder = (shouldPrint: boolean) => {
    const advanceValue = parseFloat(advanceAmount) || 0;
    const discountedGrandTotal = totals.item_value * 0.95 + totals.gst_value;
    const order: Order = {
      id: `ord-${Date.now()}`,
      order_no: generateOrderNumber(),
      customer_id: customer.id,
      customer_name: customer.name,
      group: orderDetails?.group_name,
      marketer: orderDetails?.marketer_name,
      item_value: totals.item_value,
      gst_value: totals.gst_value,
      grand_total: discountedGrandTotal,
      advance_amount: advanceValue,
      payment_status: advanceValue > 0 ? 'paid' : 'pending',
      status: 'created',
      type: 'POS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'cashier',
      items: allItems
    };

    // Save to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    if (shouldPrint) {
      // In a real app, this would trigger actual printing
      toast.success('Order created and sent to printer');
    } else {
      toast.success('Order created successfully');
    }
    onOrderCreated();
    onOpenChange(false);
  };
  const handleAddCustomItem = () => {
    const price = parseFloat(newCustomItemPrice);
    const quantity = parseInt(newCustomItemQuantity);
    if (newCustomItemName.trim() && !isNaN(price) && price > 0 && !isNaN(quantity) && quantity > 0) {
      const totalPrice = price * quantity;
      onCustomItemsChange([...customItems, {
        id: `custom-${Date.now()}`,
        name: newCustomItemName.trim(),
        quantity: quantity,
        unitPrice: price,
        price: totalPrice
      }]);
      setNewCustomItemName('');
      setNewCustomItemQuantity('1');
      setNewCustomItemPrice('');
      setIsAddingCustomItem(false);
    }
  };
  const handleRemoveCustomItem = (id: string) => {
    onCustomItemsChange(customItems.filter(item => item.id !== id));
  };
  return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto p-0 flex flex-col">
        <div className="p-3 border-b">
          <SheetHeader>
            <SheetTitle className="text-base">{customer.name}</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 ">
          {/* Customer Info */}
          <div className="space-y-1">
            <div className="text-sm space-y-0.5">
              {orderDetails?.group_name && <p><span className="text-muted-foreground">Group:</span> {orderDetails.group_name}</p>}
              {orderDetails?.marketer_name && <p><span className="text-muted-foreground">Marketer:</span> {orderDetails.marketer_name}</p>}
              {orderDetails?.transporter_name && <p><span className="text-muted-foreground">Transporter:</span> {orderDetails.transporter_name}</p>}
              {orderDetails?.delivery_address && <p><span className="text-muted-foreground">Delivery:</span> {orderDetails.delivery_address}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-sm">Items</h3>
            <div className="border rounded-lg divide-y">
              {items.map(item => <div key={item.id} className="p-2 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.product_name}</span>
                    <span className="font-semibold">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{item.variant_label} | GST ({item.tax_percent}%): {formatCurrency(item.gst)}</span>
                    <span>{item.qty} × {formatCurrency(item.price)}</span>
                  </div>
                </div>)}
            </div>
          </div>

          {/* Custom Items */}
          <div className="space-y-1.5">
            {customItems.length > 0 && (
              <div className="border rounded-lg divide-y mt-2">
                {customItems.map(item => {
                  const gst = item.price * 5 / 100;
                  const total = item.price + gst;
                  const quantity = item.quantity || 1;
                  const unitPrice = item.unitPrice || item.price;
                  return <div key={item.id} className="p-2 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.name}</span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveCustomItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>{quantity} × {formatCurrency(unitPrice)} | {formatCurrency(item.price)}</span>
                        <span className="font-semibold">{formatCurrency(total)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        GST (5%): {formatCurrency(gst)}
                      </div>
                    </div>;
                })}
              </div>
            )}

            {!isAddingCustomItem && (
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={() => setIsAddingCustomItem(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}

            {isAddingCustomItem && (
              <div className="border rounded-lg p-3 space-y-2">
                <Input placeholder="Item name" value={newCustomItemName} onChange={e => setNewCustomItemName(e.target.value)} className="h-8" />
                <div className="flex gap-2">
                  <Input type="number" placeholder="Qty" value={newCustomItemQuantity} onChange={e => setNewCustomItemQuantity(e.target.value)} className="h-8 w-20" min="1" />
                  <Input type="number" placeholder="Unit Price (excluding GST)" value={newCustomItemPrice} onChange={e => setNewCustomItemPrice(e.target.value)} className="h-8 flex-1" min="0" step="0.01" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" onClick={handleAddCustomItem} className="w-24">
                    Add Item
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setIsAddingCustomItem(false);
                    setNewCustomItemName('');
                    setNewCustomItemQuantity('1');
                    setNewCustomItemPrice('');
                  }} className="w-20">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Advance Payment */}
          <div className="space-y-1.5">
            
            <div className="space-y-1.5">
              
              <Input id="advance" type="number" min="0" max={grandTotal} step="0.01" value={advanceAmount} onChange={e => onAdvanceAmountChange(e.target.value)} placeholder="Enter advance amount" className={`my-2 ${!isAdvanceValid ? "border-red-500" : ""}`} />
              {!isAdvanceValid && <p className="text-sm text-red-500">Advance cannot exceed Grand Total</p>}
            </div>
          </div>

          {/* Totals */}
          <div className="border rounded-lg p-3 space-y-1.5 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Value:</span>
              <span className="font-medium">{formatCurrency(totals.item_value)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (5%):</span>
              <span className="font-medium">{formatCurrency(totals.gst_value)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount (5%):</span>
              <span className="font-medium">- {formatCurrency(totals.item_value * 0.05)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Grand Total:</span>
              <span>₹{Math.round(totals.item_value * 0.95 + totals.gst_value).toLocaleString('en-IN')}</span>
            </div>
            {advanceAmount && parseFloat(advanceAmount) > 0 && <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Advance:</span>
                  <span className="font-medium">- {formatCurrency(parseFloat(advanceAmount))}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Due Amount:</span>
                  <span>₹{Math.round(totals.item_value * 0.95 + totals.gst_value - parseFloat(advanceAmount)).toLocaleString('en-IN')}</span>
                </div>
              </>}
          </div>

        </div>

        {/* Actions - Sticky Bottom */}
        <div className="sticky bottom-0 border-teal pb-3 px-6 border-teal-400 ">
          <Button className="w-full" size="lg" onClick={() => handleCreateOrder(false)} disabled={!isAdvanceValid}>
            Create Order
          </Button>
        </div>
      </SheetContent>
    </Sheet>;
}