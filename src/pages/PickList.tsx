import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import ordersData from "@/data/orders.json";
import DigitalOrderPickList from "@/components/DigitalOrderPickList";
export default function PickList() {
  const {
    orderId
  } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useEffect(() => {
    const orders = ordersData as Order[];
    const found = orders.find(o => o.id === orderId);
    if (found) {
      setOrder(found);
      // Initialize checkbox state
      const initialChecked: Record<string, Record<string, boolean>> = {};
      const regularItems = found.items.filter(item => item.variant_id !== 'custom');
      const groupedItems = regularItems.reduce((acc, item) => {
        if (!acc[item.design_id]) {
          acc[item.design_id] = [];
        }
        acc[item.design_id].push(item);
        return acc;
      }, {} as Record<string, typeof found.items>);
      Object.keys(groupedItems).forEach(designId => {
        initialChecked[designId] = {};
      });
      setCheckedItems(initialChecked);
    }
  }, [orderId]);
  const handleCheckChange = (designId: string, size: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [designId]: {
        ...prev[designId],
        [size]: checked
      }
    }));
    setHasUnsavedChanges(true);
  };
  const handleSave = () => {
    setHasUnsavedChanges(false);
  };
  const handlePrint = () => {
    if (!order) return;
    const originalTitle = document.title;
    document.title = `${order.customer_name} - ${order.order_no}`;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 100);
    }, 100);
  };
  if (!order) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header with Back and Print buttons */}
      <div className="sticky top-0 z-50 border-b bg-card px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${orderId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Order No: {order.order_no}</h1>
          </div>
          
          {hasUnsavedChanges ? <Button onClick={handleSave} size="default" variant="default">
              Save
            </Button> : <Button onClick={handlePrint} size="icon" variant="outline">
              <Printer className="h-4 w-4" />
            </Button>}
        </div>
      </div>

      {/* Digital Pick List Content - Screen View */}
      <div className="max-w-4xl mx-auto p-6 print:hidden">
        <DigitalOrderPickList order={order} checkedItems={checkedItems} onCheckChange={handleCheckChange} />
      </div>

      {/* Print View */}
      <div className="print-only-single">
        <div className="p-4">
          <DigitalOrderPickList order={order} checkedItems={checkedItems} onCheckChange={handleCheckChange} />
        </div>
      </div>
    </div>;
}