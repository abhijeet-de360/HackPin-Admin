import { Order } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
interface DigitalOrderPickListProps {
  order: Order | null;
  checkedItems: Record<string, Record<string, boolean>>;
  onCheckChange: (designId: string, size: string, checked: boolean) => void;
}
export default function DigitalOrderPickList({
  order,
  checkedItems,
  onCheckChange
}: DigitalOrderPickListProps) {
  if (!order) return null;
  return <div className="p-4">
      <div className="mb-2">
        <div className="grid grid-cols-3 gap-x-4 text-sm">
          <div className="space-y-0.5">
            <p className="text-base font-bold">{order.customer_name}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="space-y-0.5">
            {order.group && <p><strong>Group:</strong> {order.group}</p>}
            {order.marketer && <p><strong>Marketer:</strong> {order.marketer}</p>}
          </div>
          <div className="space-y-0.5">
            {order.transporter && <p><strong>Transporter:</strong> {order.transporter}</p>}
            {order.delivery_address && <p><strong>Delivery:</strong> {order.delivery_address}</p>}
          </div>
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-gray-300">
            <th className="text-left py-1 w-10 border-l border-gray-300 pl-2">SL</th>
            <th className="text-left py-1 w-48 pr-2">Design ID</th>
            <th className="text-left py-1 border-r border-gray-300">Variants with SKU</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
          // Filter out custom items (they don't appear in pick list)
          const regularItems = order.items.filter(item => item.variant_id !== 'custom');

          // Group items by design_id
          const groupedItems = regularItems.reduce((acc, item) => {
            if (!acc[item.design_id]) {
              acc[item.design_id] = [];
            }
            acc[item.design_id].push(item);
            return acc;
          }, {} as Record<string, typeof order.items>);
          
          return Object.entries(groupedItems).map(([designId, variants], index) => {
            return <tr key={designId} className="border-b border-gray-300">
                  <td className="py-2 pr-1 border-l border-gray-300 pl-2">{index + 1}</td>
                  <td className="py-2 pr-2">
                    <span className="font-semibold">{designId}</span>
                  </td>
                  <td className="py-2 border-r border-gray-300">
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => {
                        const size = variant.variant_label.toUpperCase();
                        const isChecked = checkedItems[designId]?.[size] || false;
                        return <div key={variant.id} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent/50 transition-colors cursor-pointer">
                            <Checkbox checked={isChecked} onCheckedChange={checked => onCheckChange(designId, size, checked as boolean)} />
                            <span><strong className="opacity-60">{size}</strong><strong> : {variant.qty}</strong></span>
                          </div>;
                      })}
                    </div>
                  </td>
                </tr>;
          });
        })()}
        </tbody>
      </table>

      <div className="mt-2 text-sm">
        <p><strong>Total Items:</strong> {order.items.filter(item => item.variant_id !== 'custom').length} | <strong>Total Quantity:</strong> {order.items.filter(item => item.variant_id !== 'custom').reduce((sum, item) => sum + item.qty, 0)}</p>
      </div>

      {(() => {
        const customItems = order.items.filter(item => item.variant_id === 'custom');
        if (customItems.length === 0) return null;

        return (
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Custom Items</h3>
            <table className="w-full text-sm">
              <tbody>
                {customItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-1">
                      <div className="flex items-center gap-2">
                        <Checkbox />
                        <span>{index + 1}. {item.product_name}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>;
}