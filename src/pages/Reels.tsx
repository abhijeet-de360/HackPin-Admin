import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/UserMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import postsData from "@/data/post.json";
import ordersData from "@/data/orders.json";
import { Customer } from "@/types";
import { Order } from "@/types";
import { EditCustomerModal } from "@/components/category/EditCustomerModal";
import { AddCustomerDialog } from "@/components/category/AddCategoryDialog";
import { useToast } from "@/hooks/use-toast";

const Reels = () => {
  const navigate = useNavigate();                      
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [customersList, setCustomersList] = useState<Customer[]>(
    postsData as Customer[]
  );
  const [displayCount, setDisplayCount] = useState(50);
  const customers = customersList;
  const orders = ordersData as Order[];

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query) ||
        (customer.gst_number &&
          customer.gst_number.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        if (displayCount < filteredCustomers.length) {
          setDisplayCount((prev) =>
            Math.min(prev + 50, filteredCustomers.length)
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredCustomers.length]);

  // Display customers based on scroll position
  const visibleCustomers = filteredCustomers.slice(0, displayCount);

  // Calculate order stats for each customer
  const customerStats = useMemo(() => {
    const stats: Record<string, { dueOrderCount: number; totalDue: number }> =
      {};

    customers.forEach((customer) => {
      const customerOrders = orders.filter(
        (order) => order.customer_id === customer.id
      );
      // Count only orders with payment due
      const dueOrders = customerOrders.filter(
        (order) => order.grand_total - order.advance_amount > 0
      );
      const totalDue = customerOrders.reduce((sum, order) => {
        return sum + (order.grand_total - order.advance_amount);
      }, 0);

      stats[customer.id] = {
        dueOrderCount: dueOrders.length,
        totalDue,
      };
    });

    return stats;
  }, [customers, orders]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };

  const handleExportCSV = () => {
    // Export only selected customers if any are selected, otherwise export all
    const customersToExport =
      selectedCustomers.length > 0
        ? customers.filter((customer) =>
            selectedCustomers.includes(customer.id)
          )
        : customers;

    if (customersToExport.length === 0) {
      toast({
        title: "No customers to export",
        description:
          "Please select customers or clear the selection to export all",
        variant: "destructive",
      });
      return;
    }

    const csvHeaders = [
      "ID",
      "Name",
      "Phone",
      "GST Number",
      "Delivery Address",
      "Billing Address",
      "Tag",
      "Due Orders",
      "Total Due",
    ];
    const csvRows = customersToExport.map((customer) => {
      const stats = customerStats[customer.id];
      return [
        customer.id,
        customer.name,
        customer.phone,
        customer.gst_number || "",
        customer.delivery_address || "",
        customer.billing_address || "",
        customer.tag || "",
        stats.dueOrderCount,
        stats.totalDue.toFixed(2),
      ];
    });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `${customersToExport.length} customer(s) exported to CSV`,
    });
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    // In a real app, this would update the customer in the database
    toast({
      title: "Customer updated",
      description: "Customer details have been saved successfully",
    });
    setEditingCustomer(null);
  };

  const handleAddNewCustomer = (newCustomer: Customer) => {
    setCustomersList([...customersList, newCustomer]);
    toast({
      title: "Customer added",
      description: `${newCustomer.name} has been added successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Reels</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => setAddCustomerDialogOpen(true)}
              className="bg-black text-white hover:bg-black/90"
            >
              <Plus className="h-4 w-4" />
            </Button> */}
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center">
                    <Checkbox
                      checked={
                        selectedCustomers.length === filteredCustomers.length &&
                        filteredCustomers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-32">Reel Id</TableHead>
                <TableHead className="w-48">User Id</TableHead>
                <TableHead className="w-48">Status</TableHead>
                <TableHead className="w-48">Challenge</TableHead>
                <TableHead className="w-40">Anchor</TableHead>
                <TableHead className="w-40">Impression</TableHead>
                <TableHead className="w-40">Views</TableHead>
                <TableHead className="w-24">Like</TableHead>
                <TableHead className="w-32">Comment</TableHead>
                <TableHead className="w-32">Share</TableHead>
                <TableHead className="w-32">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleCustomers.map((customer) => {
                const stats = customerStats[customer.id];
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCustomer(
                              customer.id,
                              checked as boolean
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <Button
                        variant="link"
                        className="p-0 h-auto font-medium hover:no-underline"
                        onClick={() => setEditingCustomer(customer)}
                      >
                        {customer.id}
                      </Button> */}
                      RL-011
                    </TableCell>

                    <TableCell>UID-0022</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>745</TableCell>
                    <TableCell>Yes</TableCell>
                    <TableCell>1500</TableCell>
                    <TableCell>1600</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>350</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>12/09/1990</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Infinite Scroll Indicator */}
          {displayCount < filteredCustomers.length && (
            <div className="text-center py-4 text-sm text-muted-foreground border-t">
              Showing {displayCount} of {filteredCustomers.length} customers •
              Scroll for more
            </div>
          )}
          {displayCount >= filteredCustomers.length &&
            filteredCustomers.length > 50 && (
              <div className="text-center py-4 text-sm text-muted-foreground border-t">
                Showing all {filteredCustomers.length} customers
              </div>
            )}
        </div>
      </div>

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
          onSave={handleSaveCustomer}
        />
      )}
 
    </div>
  );
};

export default Reels;
