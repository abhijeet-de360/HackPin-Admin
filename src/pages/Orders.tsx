import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Printer, Check, X, Download, Search, CalendarIcon, RotateCcw, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Order } from "@/types";
import { formatCurrency } from "@/utils/calculations";
import ordersData from "@/data/orders.json";
import OrderPickList from "@/components/OrderPickList";
import { UserMenu } from "@/components/auth/UserMenu";
import { toast } from "sonner";
export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [marketerFilter, setMarketerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");                                                           
  const [createdByFilter, setCreatedByFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [displayCount, setDisplayCount] = useState(20);
  const [firstSelectedFilter, setFirstSelectedFilter] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkPrintOrders, setBulkPrintOrders] = useState<Order[]>([]);
  useEffect(() => {
    setOrders(ordersData as Order[]);
    setFilteredOrders(ordersData as Order[]);
  }, []);
  const filterOrders = useCallback(() => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_no.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.group?.toLowerCase().includes(query) ||
          order.marketer?.toLowerCase().includes(query) ||
          order.transporter?.toLowerCase().includes(query) ||
          order.created_by.toLowerCase().includes(query),
      );
    }

    // Group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((order) => order.group === groupFilter);
    }

    // Marketer filter
    if (marketerFilter !== "all") {
      filtered = filtered.filter((order) => order.marketer === marketerFilter);
    }

    // Order status filter
    if (statusFilter !== "all") {
      if (statusFilter === "not-printed") {
        filtered = filtered.filter((order) => order.status !== "printed");
      } else {
        filtered = filtered.filter((order) => order.status === statusFilter);
      }
    }

    // Created by filter
    if (createdByFilter !== "all") {
      filtered = filtered.filter((order) => order.created_by === createdByFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((order) => (order.type || 'Online') === typeFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.payment_status === paymentFilter);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((order) => new Date(order.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((order) => new Date(order.created_at) <= toDate);
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFilteredOrders(filtered);
    setDisplayCount(20);
  }, [orders, searchQuery, groupFilter, marketerFilter, statusFilter, createdByFilter, typeFilter, paymentFilter, dateFrom, dateTo]);
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);
  const getUniqueCreatedBy = () => {
    // If this is the first selected filter, show all employees. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "createdBy" ? orders : filteredOrders;
    const uniqueEmployees = Array.from(new Set(source.map((order) => order.created_by)));
    return uniqueEmployees;
  };
  const getUniqueGroups = () => {
    // If this is the first selected filter, show all groups. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "group" ? orders : filteredOrders;
    const uniqueGroups = Array.from(new Set(source.map((order) => order.group).filter(Boolean)));
    return uniqueGroups as string[];
  };
  const getUniqueMarketers = () => {
    // If this is the first selected filter, show all marketers. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "marketer" ? orders : filteredOrders;
    const uniqueMarketers = Array.from(new Set(source.map((order) => order.marketer).filter(Boolean)));
    return uniqueMarketers as string[];
  };
  const getUniqueStatuses = () => {
    // If this is the first selected filter, show all statuses. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "status" ? orders : filteredOrders;
    const uniqueStatuses = Array.from(new Set(source.map((order) => order.status)));
    return uniqueStatuses;
  };
  const getUniqueTypes = () => {
    const source = firstSelectedFilter === "type" ? orders : filteredOrders;
    const uniqueTypes = Array.from(new Set(source.map((order) => order.type || 'Online')));
    return uniqueTypes;
  };
  const getUniquePaymentStatuses = () => {
    const source = firstSelectedFilter === "payment" ? orders : filteredOrders;
    const uniquePaymentStatuses = Array.from(new Set(source.map((order) => order.payment_status)));
    return uniquePaymentStatuses;
  };
  const getStatusBadge = (status: Order["status"]) => {
    const colors = {
      created: "text-yellow-600 text-sm",
      confirmed: "text-green-600 text-sm",
      cancelled: "text-red-600 text-sm",
      printed: "text-blue-600 text-sm",
      dispatched: "text-emerald-600 text-sm",
    };
    return <span className={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };
  const getPaymentBadge = (status: Order["payment_status"]) => {
    if (status === "paid") {
      return <Badge className="bg-success text-success-foreground hover:bg-success">Paid</Badge>;
    } else if (status === "partial") {
      return <Badge variant="secondary">Partial</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        if (displayCount < filteredOrders.length) {
          setDisplayCount((prev) => Math.min(prev + 20, filteredOrders.length));
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredOrders.length]);
  const exportToCSV = () => {
    const selectedOrdersList = orders.filter((order) => selectedOrders.has(order.id));
    const headers = [
      "Order No.",
      "Date/Time",
      "Customer",
      "Group",
      "Marketer",
      "Transporter",
      "Item Count",
      "Item Value",
      "GST",
      "Grand Total",
      "Advance",
      "Payment Status",
      "Order Status",
      "Created By",
    ];
    const rows = selectedOrdersList.map((order) => [
      order.order_no,
      new Date(order.created_at).toLocaleString(),
      order.customer_name,
      order.group || "",
      order.marketer || "",
      order.transporter || "",
      order.items.length.toString(),
      order.item_value.toFixed(2),
      order.gst_value.toFixed(2),
      order.grand_total.toFixed(2),
      order.advance_amount?.toFixed(2) || "0.00",
      order.payment_status,
      order.status,
      order.created_by,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = new Set(currentOrders.map((order) => order.id));
      setSelectedOrders(allIds);
    } else {
      setSelectedOrders(new Set());
    }
  };

  // Handle individual order checkbox
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === currentOrders.length);
  };

  // Handle bulk print
  const handleBulkPrint = () => {
    const selectedOrdersList = orders.filter((order) => selectedOrders.has(order.id));
    setBulkPrintOrders(selectedOrdersList);

    const originalTitle = document.title;
    document.title = "Pick Lists";

    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.title = originalTitle;

          // Update status of selected orders to "printed"
          const updatedOrders = orders.map((order) =>
            selectedOrders.has(order.id) ? { ...order, status: "printed" as const } : order,
          );
          setOrders(updatedOrders);
          setFilteredOrders(updatedOrders.filter((order) => filteredOrders.some((fo) => fo.id === order.id)));

          setBulkPrintOrders([]);
          setSelectedOrders(new Set());
          setSelectAll(false);
        }, 100);
      }, 100);
    });
  };

  // Handle bulk digital pick list (no status update)
  const handleBulkDigitalPrint = () => {
    const selectedOrderIds = Array.from(selectedOrders);
    navigate("/pick-lists/bulk", { state: { orderIds: selectedOrderIds } });
  };

  // Handle bulk accept
  const handleBulkAccept = () => {
    const selectedOrdersList = orders.filter((order) => selectedOrders.has(order.id) && order.status === "created");
    if (selectedOrdersList.length === 0) {
      toast.error("No created orders selected");
      return;
    }

    const updatedOrders = orders.map((order) =>
      selectedOrders.has(order.id) && order.status === "created" 
        ? { ...order, status: "confirmed" as const } 
        : order
    );
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders.filter((order) => filteredOrders.some((fo) => fo.id === order.id)));
    
    setSelectedOrders(new Set());
    setSelectAll(false);
    toast.success(`${selectedOrdersList.length} order(s) confirmed`);
  };

  // Handle bulk reject
  const handleBulkReject = () => {
    const selectedOrdersList = orders.filter((order) => selectedOrders.has(order.id) && order.status === "created");
    if (selectedOrdersList.length === 0) {
      toast.error("No created orders selected");
      return;
    }

    const updatedOrders = orders.map((order) =>
      selectedOrders.has(order.id) && order.status === "created" 
        ? { ...order, status: "cancelled" as const } 
        : order
    );
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders.filter((order) => filteredOrders.some((fo) => fo.id === order.id)));
    
    setSelectedOrders(new Set());
    setSelectAll(false);
    toast.success(`${selectedOrdersList.length} order(s) cancelled`);
  };

  // Display orders based on scroll position
  const currentOrders = filteredOrders.slice(0, displayCount);
  return (
    <div className="min-h-screen bg-background">
      <OrderPickList
        order={printOrder}
        orders={bulkPrintOrders.length > 0 ? bulkPrintOrders : null}
        mode={printOrder && bulkPrintOrders.length === 0 ? "single" : "bulk"}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Orders</h1>
            {selectedOrders.size > 0 && (
              <span className="text-lg font-semibold text-primary">
                {selectedOrders.size}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.size > 0 && (
              <>
                {orders.filter((order) => selectedOrders.has(order.id)).every((order) => order.status === "created") && (
                  <>
                    <Button onClick={handleBulkAccept} size="icon" className="" title="Accept selected orders">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleBulkReject} variant="outline" size="icon" className="bg-white" title="Reject selected orders">
                      <X className="h-4 w-4 text-black" />
                    </Button>
                  </>
                )}
                <Button onClick={handleBulkPrint} variant="outline" size="icon" className="bg-white">
                  <Printer className="h-4 w-4 text-black" />
                </Button>
                {/* <Button onClick={handleBulkDigitalPrint} variant="outline" size="icon" className="bg-white">
                  <FileText className="h-4 w-4 text-black" />
                </Button> */}
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yy") : <span>From</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yy") : <span>To</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Select
              value={groupFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("group");
                } else if (value === "all" && firstSelectedFilter === "group") {
                  // Check if any other filter is selected
                  if (marketerFilter === "all" && statusFilter === "all" && createdByFilter === "all" && typeFilter === "all" && paymentFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    // Find the next selected filter
                    if (marketerFilter !== "all") setFirstSelectedFilter("marketer");
                    else if (statusFilter !== "all" && statusFilter !== "not-printed") setFirstSelectedFilter("status");
                    else if (createdByFilter !== "all") setFirstSelectedFilter("createdBy");
                    else if (typeFilter !== "all") setFirstSelectedFilter("type");
                    else if (paymentFilter !== "all") setFirstSelectedFilter("payment");
                  }
                }
                setGroupFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Groups</SelectItem>
                {getUniqueGroups().map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={marketerFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("marketer");
                } else if (value === "all" && firstSelectedFilter === "marketer") {
                  // Check if any other filter is selected
                  if (groupFilter === "all" && statusFilter === "all" && createdByFilter === "all" && typeFilter === "all" && paymentFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    // Find the next selected filter
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (statusFilter !== "all" && statusFilter !== "not-printed") setFirstSelectedFilter("status");
                    else if (createdByFilter !== "all") setFirstSelectedFilter("createdBy");
                    else if (typeFilter !== "all") setFirstSelectedFilter("type");
                    else if (paymentFilter !== "all") setFirstSelectedFilter("payment");
                  }
                }
                setMarketerFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Marketer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Marketers</SelectItem>
                {getUniqueMarketers().map((marketer) => (
                  <SelectItem key={marketer} value={marketer}>
                    {marketer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all" && value !== "not-printed") {
                  setFirstSelectedFilter("status");
                } else if ((value === "all" || value === "not-printed") && firstSelectedFilter === "status") {
                  // Check if any other filter is selected
                  if (groupFilter === "all" && marketerFilter === "all" && createdByFilter === "all" && typeFilter === "all" && paymentFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    // Find the next selected filter
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (marketerFilter !== "all") setFirstSelectedFilter("marketer");
                    else if (createdByFilter !== "all") setFirstSelectedFilter("createdBy");
                    else if (typeFilter !== "all") setFirstSelectedFilter("type");
                    else if (paymentFilter !== "all") setFirstSelectedFilter("payment");
                  }
                }
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Statuses</SelectItem>
                <SelectItem value="not-printed">Not Printed</SelectItem>
                {getUniqueStatuses().map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={createdByFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("createdBy");
                } else if (value === "all" && firstSelectedFilter === "createdBy") {
                  // Check if any other filter is selected
                  if (groupFilter === "all" && marketerFilter === "all" && statusFilter === "all" && typeFilter === "all" && paymentFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    // Find the next selected filter
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (marketerFilter !== "all") setFirstSelectedFilter("marketer");
                    else if (statusFilter !== "all" && statusFilter !== "not-printed") setFirstSelectedFilter("status");
                    else if (typeFilter !== "all") setFirstSelectedFilter("type");
                    else if (paymentFilter !== "all") setFirstSelectedFilter("payment");
                  }
                }
                setCreatedByFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Created By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Employees</SelectItem>
                {getUniqueCreatedBy().map((employee) => (
                  <SelectItem key={employee} value={employee}>
                    {employee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("type");
                } else if (value === "all" && firstSelectedFilter === "type") {
                  if (groupFilter === "all" && marketerFilter === "all" && statusFilter === "all" && createdByFilter === "all" && paymentFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (marketerFilter !== "all") setFirstSelectedFilter("marketer");
                    else if (statusFilter !== "all" && statusFilter !== "not-printed") setFirstSelectedFilter("status");
                    else if (createdByFilter !== "all") setFirstSelectedFilter("createdBy");
                    else if (paymentFilter !== "all") setFirstSelectedFilter("payment");
                  }
                }
                setTypeFilter(value);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Types</SelectItem>
                {getUniqueTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={paymentFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("payment");
                } else if (value === "all" && firstSelectedFilter === "payment") {
                  if (groupFilter === "all" && marketerFilter === "all" && statusFilter === "all" && createdByFilter === "all" && typeFilter === "all") {
                    setFirstSelectedFilter(null);
                  } else {
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (marketerFilter !== "all") setFirstSelectedFilter("marketer");
                    else if (statusFilter !== "all" && statusFilter !== "not-printed") setFirstSelectedFilter("status");
                    else if (createdByFilter !== "all") setFirstSelectedFilter("createdBy");
                    else if (typeFilter !== "all") setFirstSelectedFilter("type");
                  }
                }
                setPaymentFilter(value);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Payment</SelectItem>
                {getUniquePaymentStatuses().map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setGroupFilter("all");
                setMarketerFilter("all");
                setStatusFilter("all");
                setCreatedByFilter("all");
                setTypeFilter("all");
                setPaymentFilter("all");
                setDateFrom(undefined);
                setDateTo(undefined);
                setFirstSelectedFilter(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">No orders found</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-12">
                        <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Order No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date/Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Group</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Marketer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Advance</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Kajal Staff</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-medium cursor-pointer text-primary hover:underline"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          {order.order_no}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {order.type || 'Online'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{order.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{order.group || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{order.marketer || "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {formatCurrency(order.item_value * 0.95 + order.gst_value)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(order.advance_amount || 0)}
                        </td>
                        <td className="px-4 py-3 text-left">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-sm">{order.created_by}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const updatedOrders = orders.map((o) =>
                                  o.id === order.id
                                    ? {
                                        ...o,
                                        status: "printed" as const,
                                      }
                                    : o,
                                );
                                setOrders(updatedOrders);
                                setPrintOrder(order);

                                const originalTitle = document.title;
                                document.title = `${order.customer_name} - ${order.order_no}`;

                                requestAnimationFrame(() => {
                                  setTimeout(() => {
                                    window.print();
                                    setTimeout(() => {
                                      document.title = originalTitle;
                                      setPrintOrder(null);
                                    }, 100);
                                  }, 100);
                                });
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infinite Scroll Indicator */}
            {displayCount < filteredOrders.length && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing {displayCount} of {filteredOrders.length} orders • Scroll for more
              </div>
            )}
            {displayCount >= filteredOrders.length && filteredOrders.length > 20 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing all {filteredOrders.length} orders
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
