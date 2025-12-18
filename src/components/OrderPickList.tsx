import { Order } from '@/types';

interface OrderPickListProps {
  order: Order | null;
  orders?: Order[] | null;
  mode?: 'single' | 'bulk';
}

export default function OrderPickList({ order, orders, mode = 'bulk' }: OrderPickListProps) {
  // If orders array is provided, render multiple pick lists with page breaks (bulk mode)
  if (orders && orders.length > 0) {
    return (
      <div className="print-only-bulk">
        {orders.map((ord, index) => (
          <div key={ord.id} className={index < orders.length - 1 ? 'page-break' : ''}>
            <SingleOrderPickList order={ord} />
          </div>
        ))}
      </div>
    );
  }

  // Otherwise, render single pick list
  if (!order) return null;
  
  // Use different class based on mode
  const className = mode === 'single' ? 'print-only-single' : 'print-only-bulk';
  
  return (
    <div className={className}>
      <SingleOrderPickList order={order} />
    </div>
  );
}

function SingleOrderPickList({ order }: { order: Order }) {
  return (
    <div className="p-4">
        <div className="mb-2">
          <div className="grid grid-cols-2 gap-x-4 text-xs">
            <div className="space-y-0.5">
              <p className="text-base font-bold">{order.customer_name}</p>
              <p><strong>Order No:</strong> {order.order_no}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="space-y-0.5">
              {order.group && <p><strong className="text-base">Group:</strong> <span className="text-base font-bold">{order.group}</span></p>}
              {order.marketer && <p><strong>Marketer:</strong> {order.marketer}</p>}
              {order.transporter && <p><strong>Transporter:</strong> {order.transporter}</p>}
              {order.delivery_address && <p><strong>Delivery:</strong> {order.delivery_address}</p>}
            </div>
          </div>
        </div>

        <table className="w-full border-collapse text-xs border-l border-r border-t border-gray-300">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1 w-6 pl-2">SL</th>
              <th className="text-left py-1 w-32">Design ID</th>
              <th className="text-left py-1">3XL</th>
              <th className="text-left py-1">2XL</th>
              <th className="text-left py-1">XL</th>
              <th className="text-left py-1">L</th>
              <th className="text-left py-1">M</th>
              <th className="text-left py-1">S</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const sizes = ['3XL', '2XL', 'XL', 'L', 'M', 'S'];
              
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
                // Create a map of size to variant for quick lookup
                const sizeMap = variants.reduce((acc, variant) => {
                  const size = variant.variant_label.toUpperCase();
                  acc[size] = variant;
                  return acc;
                }, {} as Record<string, typeof variants[0]>);

                return (
                  <tr key={designId} className="border-b border-gray-300">
                    <td className="py-0.5 pr-1 pl-2">{index + 1}</td>
                    <td className="py-0.5 pr-2">
                      <span className="font-semibold">{designId}</span>
                    </td>
                    {sizes.map(size => {
                      const variant = sizeMap[size];
                      return (
                        <td key={size} className="py-0.5 text-left">
                          {variant ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="checkbox" 
                                className="w-3 h-3 border border-gray-400"
                              />
                              <span><strong>{variant.qty}</strong></span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>

        <div className="mt-2 text-xs">
          <p><strong>Total Items:</strong> {order.items.filter(item => item.variant_id !== 'custom').length} | <strong>Total Quantity:</strong> {order.items.filter(item => item.variant_id !== 'custom').reduce((sum, item) => sum + item.qty, 0)}</p>
        </div>

        {(() => {
          const customItems = order.items.filter(item => item.variant_id === 'custom');
          if (customItems.length === 0) return null;

          return (
            <div className="mt-4">
              <h3 className="text-xs font-semibold mb-2">Custom Items</h3>
              <table className="w-full text-xs">
                <tbody>
                  {customItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-0.5">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-3 h-3 border border-gray-400" />
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
      </div>
  );
}
