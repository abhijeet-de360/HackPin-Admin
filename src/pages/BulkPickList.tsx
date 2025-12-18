import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import ordersData from '@/data/orders.json';
import DigitalOrderPickList from '@/components/DigitalOrderPickList';

export default function BulkPickList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkedItems, setCheckedItems] = useState<
    Record<string, Record<string, Record<string, boolean>>>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const orderIds = location.state?.orderIds as string[] | undefined;
    if (!orderIds || orderIds.length === 0) {
      navigate('/orders');
      return;
    }

    const selectedOrders = (ordersData as Order[]).filter(order =>
      orderIds.includes(order.id)
    );
    setOrders(selectedOrders);
  }, [location.state, navigate]);

  const handleCheckChange = (orderId: string, designId: string, size: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [designId]: {
          ...(prev[orderId]?.[designId] || {}),
          [size]: checked
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = 'Digital Pick Lists';
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 100);
    }, 100);
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - not printed */}
      <header className="border-b bg-card px-6 py-4 print:hidden sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
            </span>
          </div>
          {hasUnsavedChanges ? (
            <Button onClick={handleSave} size="default" variant="default">
              Save
            </Button>
            // This is save button
          ) : (
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          )}
        </div>
      </header>

      {/* Content - Screen View */}
      <div className="p-6 max-w-[1200px] mx-auto print:hidden">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`border border-border rounded-lg p-6 ${
              index < orders.length - 1 ? 'mb-8' : ''
            }`}
          >
            <DigitalOrderPickList
              order={order}
              checkedItems={checkedItems[order.id] || {}}
              onCheckChange={(designId, size, checked) =>
                handleCheckChange(order.id, designId, size, checked)
              }
            />
          </div>
        ))}
      </div>

      {/* Print View */}
      <div className="print-only-bulk">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`p-4 ${
              index < orders.length - 1 ? 'digital-picklist-page-break' : ''
            }`}
          >
            <DigitalOrderPickList
              order={order}
              checkedItems={checkedItems[order.id] || {}}
              onCheckChange={(designId, size, checked) =>
                handleCheckChange(order.id, designId, size, checked)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
