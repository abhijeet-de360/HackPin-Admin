import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  Ban,
  Save,
  Plus,
  X,
  Truck,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Order, PaymentStatus, OrderItem } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import { toast } from "sonner";
import usersData from "@/data/user.json";
import OrderPickList from "@/components/OrderPickList";
export default function OrderDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [note, setNote] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [customerName, setCustomerName] = useState("");
  const [group, setGroup] = useState("");
  const [marketer, setMarketer] = useState("");
  const [transporter, setTransporter] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customItems, setCustomItems] = useState<
    Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      price: number;
    }>
  >([]);
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false);
  const [newCustomItemName, setNewCustomItemName] = useState("");
  const [newCustomItemQuantity, setNewCustomItemQuantity] = useState("1");
  const [newCustomItemPrice, setNewCustomItemPrice] = useState("");
  useEffect(() => {
    loadOrder();
  }, [userId]);
  const loadOrder = () => {
    const orders = usersData as Order[];
    const found = orders.find((o) => o.id === userId);
    if (found) {
      setOrder(found);
      setNote(found.note || "");
      setAdvanceAmount(found.advance_amount || 0);
      setPaymentStatus(found.payment_status);
      setCustomerName(found.customer_name);
      setGroup(found.group || "");
      setMarketer(found.marketer || "");
      setTransporter(found.transporter || "");
      setDeliveryAddress(found.delivery_address || "");

 
      const existingCustomItems = found.items
        .filter((item) => item.variant_id === "custom")
        .map((item) => {
 
          const quantity = (item as any).quantity || 1;
          const unitPrice = (item as any).unitPrice || item.value;
          return {
            id: item.id,
            name: item.product_name,
            quantity: quantity,
            unitPrice: unitPrice,
            price: item.value,
          };
        });
      setCustomItems(existingCustomItems);
    }
  };
 
  const handleSave = () => {
    toast.success("Information saved");
  };
  const handleAddCustomItem = () => {
    const price = parseFloat(newCustomItemPrice);
    const quantity = parseInt(newCustomItemQuantity);
    if (
      newCustomItemName.trim() &&
      !isNaN(price) &&
      price > 0 &&
      !isNaN(quantity) &&
      quantity > 0
    ) {
      const totalPrice = price * quantity;
      setCustomItems([
        ...customItems,
        {
          id: `custom-${Date.now()}`,
          name: newCustomItemName.trim(),
          quantity: quantity,
          unitPrice: price,
          price: totalPrice,
        },
      ]);
      setNewCustomItemName("");
      setNewCustomItemQuantity("1");
      setNewCustomItemPrice("");
      setIsAddingCustomItem(false);
      toast.success("Custom item added");
    }
  };
 
  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }
  const isEditable = order.status === "created";
  const canConfirm = order.status === "created";
  const canCancel =
    order.status !== "cancelled" && order.status !== "dispatched";
  const canPrint = order.status === "confirmed";
  const canDispatch = order.status === "printed";
  const canAddCustomItems = order.status === "created";
  const showCustomItemsSection =
    order.status === "created" || customItems.length > 0;
  const showAddCustomItemButton = order.status === "created";
  const getStatusBadge = () => {
    const colors = {
      created: " text-warning hover:bg-warning text-sm",
      confirmed: "text-success hover:bg-success text-sm",
      cancelled: " text-destructive hover:bg-destructive text-sm",
      printed: " text-black hover:bg-blue-500 text-sm",
      dispatched: " text-black hover:bg-green-600 text-sm",
    };
    return (
      <p className={colors[order.status]}>
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </p>
    );
  };
 
  const customOrderItems: OrderItem[] = customItems.map((item) => {
    const gst = (item.price * 5) / 100;
    const total = item.price + gst;
    return {
      id: item.id,
      variant_id: "custom",
      product_name: item.name,
      design_id: "",
      variant_label: "",
      price: item.price,
      qty: 1,
      tax_percent: 5,
      value: item.price,
      gst: Math.round(gst * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  });
  const customItemsTotal = customOrderItems.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const customItemsValue = customOrderItems.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const customItemsGST = customOrderItems.reduce(
    (sum, item) => sum + item.gst,
    0
  );
  return (
    <div className="min-h-screen bg-background">
      {/* Pick List for printing */}
      <OrderPickList order={printOrder} orders={null} mode="single" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm">{order.order_no}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleString("en-IN")} |{" "}
                {order.created_by}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="icon"
              className="bg-black hover:bg-black/90 text-white"
            >
              <Save />
            </Button>
 
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 pb-6 max-w-7xl mx-auto pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Items - Editable when order is not dispatched */}
            {showCustomItemsSection && (
              <div className="border rounded-lg overflow-hidden bg-card">
                <div className="overflow-x-auto mb-3">
                  <table className="w-100">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Challenge Id
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Post Id
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Anchor
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Impression
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Views
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Like
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Comment
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Share
                        </th>
 
                      </tr>
                    </thead>
                    <tbody>
                      {customItems.map((item) => {
                        const gst = (item.price * 5) / 100;
                        const total = item.price + gst;
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="px-4 py-1.5 text-sm font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              Demo Challenge
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              yes
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              1544
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              1300
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              400
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              315
                            </td>
                            <td className="px-4 py-1.5 text-sm text-left">
                              100
                            </td>
 
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {isAddingCustomItem && (
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Item name"
                        value={newCustomItemName}
                        onChange={(e) => setNewCustomItemName(e.target.value)}
                        className="h-8 flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={newCustomItemQuantity}
                        onChange={(e) =>
                          setNewCustomItemQuantity(e.target.value)
                        }
                        className="h-8 w-16"
                        min="1"
                      />
                      <Input
                        type="number"
                        placeholder="Unit Price (excluding GST)"
                        value={newCustomItemPrice}
                        onChange={(e) => setNewCustomItemPrice(e.target.value)}
                        className="h-8 w-40"
                        min="0"
                        step="0.01"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setIsAddingCustomItem(false);
                          setNewCustomItemName("");
                          setNewCustomItemQuantity("1");
                          setNewCustomItemPrice("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddCustomItem}
                        className="h-8"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Items */}
            {(() => {
              const regularItems = order.items.filter(
                (item) => item.variant_id !== "custom"
              );
              if (regularItems.length === 0) return null;
              return (
                <div className="border rounded-lg overflow-hidden bg-card ">
                  <div className="overflow-x-auto">
                    <table className="w-auto">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-2 text-left text-sm font-semibold">
                            Post Id
                          </th>
                          <th className="px-2 py-2 text-left text-sm font-semibold">
                            Title
                          </th>
                          <th className="px-2 py-2 text-left text-sm font-semibold">
                            Anchor
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Imp.
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Views
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Like
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Comment
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Share
                          </th>
                          <th className="px-2 py-2 text-right text-sm font-semibold">
                            Ch.Id
                          </th>
                          <th className="px-10 py-2 text-right text-sm font-semibold">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Group items by product name
                          const groupedItems = regularItems.reduce(
                            (acc, item) => {
                              const key = `${item.design_id}-${item.product_name}`;
                              if (!acc[key]) {
                                acc[key] = {
                                  design_id: item.design_id,
                                  product_name: item.product_name,
                                  variants: [],
                                };
                              }
                              acc[key].variants.push(item);
                              return acc;
                            },
                            {} as Record<
                              string,
                              {
                                design_id: string;
                                product_name: string;
                                variants: typeof regularItems;
                              }
                            >
                          );
                          return Object.entries(groupedItems).flatMap(
                            ([key, { design_id, product_name, variants }]) => {
                              return (
                                <tr key={design_id} className="border-b">
                                  <td className="px-3 py-1.5 text-sm">
                                    <div className="font-semibold">
                                      PT-003d25
                                    </div>
                                  </td>
                                  <td className="px-5 py-1.5 text-sm text-center">
                                     Welcome to Darjeeling
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center">
                                    Yes
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center">
                                    1500
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center">
                                    1600
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center">
                                    300
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center font-semibold">
                                    100
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center font-semibold">
                                    50
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center font-semibold">
                                    CH-0022
                                  </td>
                                  <td className="px-3 py-1.5 text-sm text-center font-semibold">
                                    01/04/2019
                                  </td>
                                </tr>
                              );
                            }
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sidebar - Customer Info, Summary & Actions */}
          <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 lg:block lg:space-y-6 lg:sticky lg:top-[88px] lg:self-start">
            {/* Customer Info */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[90px]">
                    Name:
                  </span>
                  {isEditable ? (
                    <Input
                      value={"Rajesh Kumar"}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-7 flex-1"
                    />
                  ) : (
                    <span className="font-medium"> </span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[90px]">
                    Email:
                  </span>
                  {isEditable ? (
                    <Input
                      value={"rajesh@gmail.com"}
                      onChange={(e) => setGroup(e.target.value)}
                      className="h-7 flex-1"
                    />
                  ) : (
                    <span className="font-medium"></span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[90px]">
                    Mobile:
                  </span>
                  {isEditable ? (
                    <Input
                      value={"9876543210"}
                      onChange={(e) => setMarketer(e.target.value)}
                      className="h-7 flex-1"
                    />
                  ) : (
                    <span className="font-medium">{marketer || "-"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[90px]">
                    Location:
                  </span>
                  {isEditable ? (
                    <Input
                      value={"kolkata"}
                      onChange={(e) => setTransporter(e.target.value)}
                      className="h-7 flex-1"
                    />
                  ) : (
                    <span className="font-medium">{transporter || "-"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground min-w-[90px]">
                    Date:
                  </span>
                  {isEditable ? (
                    <Input
                      value={"13/11/1335"}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="h-7 flex-1"
                    />
                  ) : (
                    <span className="font-medium">
                      {deliveryAddress || "-"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="space-y-3">
                {customItems.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <div className="flex flex-col">
                      <div className="flex flex-row justify-between gap-24 pb-2">
                        <span className="text-muted-foreground">Id</span>
                        <span className="text-muted-foreground">Date</span>
                        <span className="text-muted-foreground">Amount</span>
                      </div>
                      <div className="flex flex-row justify-between gap-24">
                        <span className="text-foreground">PMT-001</span>
                        <span className="text-foreground">12/12/2000</span>
                        <span className="text-foreground">1300</span>
                      </div>
                    </div>
                  </div>
                )}
 
                <div className="flex justify-between text-sm font-bold pt-3 border-t">
                  <span>Grand Total:</span>
                  <span>
                    {formatCurrency(
                      order.item_value * 0.95 +
                        order.gst_value +
                        customItemsTotal
                    )}
                  </span>
                </div>
 

                {/* Payment Status */}
                <div className="pt-3 border-t">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Status
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        paymentStatus === "pending" ? "default" : "outline"
                      }
                      onClick={() => {
                        if (paymentStatus !== "paid") {
                          setPaymentStatus("pending");
                          toast.success("Payment status updated to pending");
                        }
                      }}
                      disabled={paymentStatus === "paid"}
                      className="flex-1"
                    >
                      Active
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        paymentStatus === "partial" ? "default" : "outline"
                      }
                      onClick={() => {
                        if (paymentStatus !== "paid") {
                          setPaymentStatus("partial");
                          toast.success("Payment status updated to partial");
                        }
                      }}
                      disabled={paymentStatus === "paid"}
                      className="flex-1"
                    >
                      Inactive
                    </Button>
                    <Button
                      size="sm"
                      variant={paymentStatus === "paid" ? "default" : "outline"}
                      onClick={() => {
                        setPaymentStatus("paid");
                        toast.success(
                          "Payment marked as paid - cannot be changed"
                        );
                      }}
                      className="flex-1"
                    >
                      Deleted
                    </Button>
                  </div>
 
                </div>
              </div>
            </div>
 
          </div>
        </div>
      </div>
    </div>
  );
}
