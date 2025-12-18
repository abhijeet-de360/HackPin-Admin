import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerRow } from "@/components/pos/CustomerRow";
import { ProductColumn } from "@/components/pos/ProductColumn";
import { CheckoutDrawer } from "@/components/pos/CheckoutDrawer";
import { AddCustomerDialog } from "@/components/pos/AddCustomerDialog";
import { AddProductDialog } from "@/components/pos/AddProductDialog";
import { UserMenu } from "@/components/auth/UserMenu";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Product, Customer, GridCell, SessionData } from "@/types";
import productsData from "@/data/products.json";
import customersData from "@/data/customers.json";

export function POSBilling() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [orderDetails, setOrderDetails] = useState<
    Record<string, { group_name: string; marketer_name: string; transporter_name: string; delivery_address: string }>
  >({});
  const [customItems, setCustomItems] = useState<Record<string, Array<{ id: string; name: string; quantity: number; unitPrice: number; price: number }>>>(
    {},
  );
  const [discounts, setDiscounts] = useState<Record<string, number>>({});
  const [advanceAmounts, setAdvanceAmounts] = useState<Record<string, number>>({});
  const [checkoutCustomerId, setCheckoutCustomerId] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [removeConfirmation, setRemoveConfirmation] = useState<{
    type: "customer" | "product";
    id: string;
    name: string;
  } | null>(null);
  const [searchMode, setSearchMode] = useState<"customer" | "product">("customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [highlightedCustomers, setHighlightedCustomers] = useState<Set<string>>(new Set());
  const customerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Touch scroll locking refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollDirectionRef = useRef<"horizontal" | "vertical" | null>(null);

  useEffect(() => {
    setProducts(productsData as Product[]);
    setCustomers(customersData as Customer[]);
    loadSession();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      saveSession();
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedCustomers, selectedProducts, cells, orderDetails, customItems, discounts, advanceAmounts]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const timer = setTimeout(() => {
        if (searchMode === "customer") {
          handleCustomerSearch(searchTerm);
        } else {
          handleProductSearch(searchTerm);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, searchMode]);

  const loadSession = () => {
    const saved = localStorage.getItem("pos-session");
    if (saved) {
      const session: any = JSON.parse(saved);
      setSelectedCustomers(session.customers || []);
      setSelectedProducts(session.products || []);
      setCells(session.cells || []);
      setOrderDetails(session.orderDetails || {});
      
      // Migrate old custom items format to new format with quantity and unitPrice
      const migratedCustomItems: Record<string, Array<{ id: string; name: string; quantity: number; unitPrice: number; price: number }>> = {};
      if (session.customItems) {
        Object.keys(session.customItems).forEach(customerId => {
          migratedCustomItems[customerId] = session.customItems[customerId].map((item: any) => {
            // If old format (no quantity/unitPrice), migrate it
            if (typeof item.quantity === 'undefined') {
              return {
                id: item.id,
                name: item.name,
                quantity: 1,
                unitPrice: item.price,
                price: item.price
              };
            }
            return item;
          });
        });
      }
      
      setCustomItems(migratedCustomItems);
      setDiscounts(session.discounts || {});
      setAdvanceAmounts(session.advanceAmounts || {});
    }
  };

  const saveSession = () => {
    const session: SessionData = {
      customers: selectedCustomers,
      products: selectedProducts,
      cells,
      orderDetails,
      customItems,
      discounts,
      advanceAmounts,
    };
    localStorage.setItem("pos-session", JSON.stringify(session));
  };

  const handleAddCustomer = (
    customerId: string,
    orderDetailsInput?: {
      group_name: string;
      marketer_name: string;
      transporter_name: string;
      delivery_address: string;
    },
  ) => {
    if (!selectedCustomers.includes(customerId)) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }

    // Store order-specific details
    if (orderDetailsInput) {
      setOrderDetails((prev) => ({
        ...prev,
        [customerId]: orderDetailsInput,
      }));
    }

    setShowAddCustomer(false);
  };

  const handleAddNewCustomer = (customer: Customer) => {
    setCustomers((prev) => [...prev, customer]);
    setSelectedCustomers((prev) => [...prev, customer.id]);
    setShowAddCustomer(false);
  };

  const handleAddProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
    setShowAddProduct(false);
  };

  const handleQuantityChange = (customerId: string, variantId: string, qty: number) => {
    setCells((prev) => {
      const existing = prev.find((c) => c.customer_id === customerId && c.variant_id === variantId);
      if (existing) {
        if (qty === 0) {
          return prev.filter((c) => !(c.customer_id === customerId && c.variant_id === variantId));
        }
        return prev.map((c) => (c.customer_id === customerId && c.variant_id === variantId ? { ...c, qty } : c));
      } else if (qty > 0) {
        return [...prev, { customer_id: customerId, variant_id: variantId, qty }];
      }
      return prev;
    });
  };

  const getQuantity = (customerId: string, variantId: string): number => {
    return cells.find((c) => c.customer_id === customerId && c.variant_id === variantId)?.qty || 0;
  };

  const confirmRemoveCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    // Check if customer has items in cart
    const hasItems =
      cells.some((c) => c.customer_id === customerId) ||
      (customItems[customerId] && customItems[customerId].length > 0);

    if (hasItems) {
      setRemoveConfirmation({ type: "customer", id: customerId, name: customer.name });
    } else {
      // Remove directly without confirmation if no items
      handleRemoveCustomer(customerId);
    }
  };

  const handleRemoveCustomer = (customerId: string) => {
    // Remove customer's cells first to restore stock
    setCells((prev) => {
      const filteredCells = prev.filter((c) => c.customer_id !== customerId);
      return filteredCells;
    });

    // Then remove customer from selection
    setSelectedCustomers((prev) => prev.filter((id) => id !== customerId));

    // Clean up order details and custom items
    setOrderDetails((prev) => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });

    setCustomItems((prev) => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });

    setRemoveConfirmation(null);
  };

  const handleClearCustomer = (customerId: string) => {
    setCells((prev) => prev.filter((c) => c.customer_id !== customerId));
    setDiscounts((prev) => {
      const updated = { ...prev };
      delete updated[customerId];
      return updated;
    });
  };

  const handleEditCustomer = (customerId: string, updatedCustomer: Partial<Customer>, updatedOrderDetails: any) => {
    // Update customer data
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, ...updatedCustomer } : c)));

    // Update order details
    setOrderDetails((prev) => ({
      ...prev,
      [customerId]: updatedOrderDetails,
    }));
  };

  const handleCustomerSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const matchedCustomer = selectedCustomers.find((customerId) => {
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return false;

      const searchLower = searchTerm.toLowerCase();
      return customer.name.toLowerCase().includes(searchLower) || customer.phone.includes(searchTerm);
    });

    if (matchedCustomer && customerRefs.current[matchedCustomer]) {
      customerRefs.current[matchedCustomer]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setHighlightedCustomerId(matchedCustomer);
      setTimeout(() => setHighlightedCustomerId(null), 2000);
    }
  };

  const handleProductSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const searchLower = searchTerm.toLowerCase();
    const matchedProduct = selectedProducts.find((productId) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return false;

      return (
        product.design_id.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    });

    if (matchedProduct && productRefs.current[matchedProduct]) {
      productRefs.current[matchedProduct]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });

      setHighlightedProductId(matchedProduct);
      setTimeout(() => setHighlightedProductId(null), 2000);
    }
  };

  const confirmRemoveProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Get all variant IDs for this product
    const variantIds = product.variants.map((v) => v.id);

    // Check if any customer has this product's variants in cart
    const hasItems = cells.some((c) => variantIds.includes(c.variant_id));

    if (hasItems) {
      setRemoveConfirmation({ type: "product", id: productId, name: `${product.design_id} - ${product.name}` });
    } else {
      // Remove directly without confirmation if no items
      handleRemoveProduct(productId);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Get all variant IDs for this product
    const variantIds = product.variants.map((v) => v.id);

    // Remove all cells with these variant IDs to restore stock
    setCells((prev) => {
      const filteredCells = prev.filter((c) => !variantIds.includes(c.variant_id));
      return filteredCells;
    });

    // Then remove product from selection
    setSelectedProducts((prev) => prev.filter((id) => id !== productId));

    setRemoveConfirmation(null);
  };

  const handleHighlightToggle = (customerId: string) => {
    setHighlightedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  // Touch scroll locking handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    scrollDirectionRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !scrollContainerRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Determine scroll direction on first significant movement
    if (!scrollDirectionRef.current && (deltaX > 5 || deltaY > 5)) {
      scrollDirectionRef.current = deltaX > deltaY ? "horizontal" : "vertical";

      // Apply CSS to lock the opposite direction
      if (scrollDirectionRef.current === "horizontal") {
        scrollContainerRef.current.style.overflowY = "hidden";
      } else {
        scrollContainerRef.current.style.overflowX = "hidden";
      }
    }
  };

  const handleTouchEnd = () => {
    if (scrollContainerRef.current) {
      // Reset overflow after a brief delay to allow scroll to complete
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.overflowY = "auto";
          scrollContainerRef.current.style.overflowX = "auto";
        }
      }, 100);
    }
    touchStartRef.current = null;
    scrollDirectionRef.current = null;
  };

  // Calculate row height for EACH customer individually
  const calculateRowHeightForCustomer = (customerId: string) => {
    if (selectedProducts.length === 0) return 250;

    // Count how many items (variants) this customer has
    const customerCells = cells.filter((c) => c.customer_id === customerId);
    const customerItems = customerCells.length;
    const customItemsCount = (customItems[customerId] || []).length;

    // Calculate content height needed
    const topPadding = 12;
    const bottomPadding = 16;
    const customerInfoHeight = 100; // Customer name, group, marketer, etc.
    const totalsHeight = 80 + (customItemsCount > 0 ? 20 : 0) + (advanceAmounts[customerId] > 0 ? 40 : 0);
    const buttonsHeight = 36;
    const spacing = 12;

    // Max variants across all selected products (determines variant rows in product columns)
    let maxVariants = 0;
    selectedProducts.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        maxVariants = Math.max(maxVariants, product.variants.length);
      }
    });

    const variantRowsHeight = maxVariants * 40;
    const productBottomHeight = 60; // Product totals section

    // Customer column needs space for info + totals + buttons
    const customerMinHeight = topPadding + customerInfoHeight + totalsHeight + buttonsHeight + spacing + bottomPadding;

    // Product columns need space for variants + totals
    const productMinHeight = topPadding + variantRowsHeight + productBottomHeight + bottomPadding;

    // Row height is the maximum of both
    return Math.max(customerMinHeight, productMinHeight, 250);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">KAJAL</h1>
        <div className="flex items-center gap-3">
          <Button 
          size="icon"
            onClick={() => setShowAddCustomer(true)} 
            variant="outline"
            disabled={selectedProducts.length === 0}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => setShowAddProduct(true)} variant="outline">
            <Package className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </header>

      {/* Grid - Single scrollable container for synchronized vertical scrolling */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex" style={{ minWidth: `${256 + selectedProducts.length * 260}px` }}>
          {/* Customer Column - Sticky on left */}
          <div className="w-64 flex-none bg-card sticky left-0 z-20">
            {(selectedCustomers.length > 0 || selectedProducts.length > 0) && (
              <div className="sticky top-0 bg-background z-30 border-b border-r h-16 px-4 py-3 flex items-center gap-2">
                <button
                  onClick={() => setSearchMode(searchMode === "customer" ? "product" : "customer")}
                  className="relative h-5 w-10 rounded-full bg-secondary transition-colors flex-shrink-0"
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-primary transition-transform ${
                      searchMode === "product" ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <Input
                  placeholder={searchMode === "customer" ? "Search customer..." : "Search product..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-7 text-sm border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-2"
                />
              </div>
            )}
            {selectedCustomers.map((customerId) => {
              const customer = customers.find((c) => c.id === customerId);
              if (!customer) return null;

              const rowHeight = calculateRowHeightForCustomer(customerId);

              return (
                <div
                  key={customerId}
                  ref={(el) => (customerRefs.current[customerId] = el)}
                  className={highlightedCustomerId === customerId ? "ring-2 ring-primary" : ""}
                >
                  <CustomerRow
                    customer={customer}
                    cells={cells.filter((c) => c.customer_id === customerId)}
                    products={products}
                    rowHeight={rowHeight}
                    orderDetails={orderDetails[customerId]}
                    customItems={customItems[customerId] || []}
                    discount={discounts[customerId] || 0}
                    advanceAmount={advanceAmounts[customerId] || 0}
                    isHighlighted={highlightedCustomers.has(customerId)}
                    onToggleHighlight={() => handleHighlightToggle(customerId)}
                    onDiscountChange={(discount) => setDiscounts((prev) => ({ ...prev, [customerId]: discount }))}
                    onCheckout={() => setCheckoutCustomerId(customerId)}
                    onClear={() => handleClearCustomer(customerId)}
                    onRemove={() => confirmRemoveCustomer(customerId)}
                    onEdit={(updatedCustomer, updatedOrderDetails) =>
                      handleEditCustomer(customerId, updatedCustomer, updatedOrderDetails)
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Product Columns - Scroll horizontally */}
          {selectedProducts.map((productId) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return null;

            const selectedCustomerObjs = selectedCustomers
              .map((id) => customers.find((c) => c.id === id))
              .filter(Boolean) as Customer[];

            return (
              <div
                key={productId}
                ref={(el) => (productRefs.current[productId] = el)}
                className={highlightedProductId === productId ? "ring-2 ring-primary" : ""}
              >
                <ProductColumn
                  product={product}
                  customers={selectedCustomerObjs}
                  selectedCustomers={selectedCustomers}
                  calculateRowHeight={calculateRowHeightForCustomer}
                  highlightedCustomers={highlightedCustomers}
                  getQuantity={getQuantity}
                  onQuantityChange={handleQuantityChange}
                  onRemove={() => confirmRemoveProduct(productId)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout Drawer */}
      {checkoutCustomerId && (
        <CheckoutDrawer
          open={!!checkoutCustomerId}
          onOpenChange={(open) => !open && setCheckoutCustomerId(null)}
          customer={customers.find((c) => c.id === checkoutCustomerId)!}
          cells={cells.filter((c) => c.customer_id === checkoutCustomerId)}
          products={products}
          orderDetails={orderDetails[checkoutCustomerId]}
          customItems={customItems[checkoutCustomerId] || []}
          onCustomItemsChange={(items) => setCustomItems((prev) => ({ ...prev, [checkoutCustomerId]: items }))}
          advanceAmount={advanceAmounts[checkoutCustomerId]?.toString() || ""}
          onAdvanceAmountChange={(amount) => {
            const numAmount = parseFloat(amount) || 0;
            setAdvanceAmounts((prev) => ({ ...prev, [checkoutCustomerId]: numAmount }));
          }}
          onOrderCreated={() => {
            // Clear customer cells (stock is auto-deducted)
            setCells((prev) => prev.filter((c) => c.customer_id !== checkoutCustomerId));

            // Remove customer from POS
            setSelectedCustomers((prev) => prev.filter((id) => id !== checkoutCustomerId));

            // Clean up order details and custom items
            setOrderDetails((prev) => {
              const updated = { ...prev };
              delete updated[checkoutCustomerId];
              return updated;
            });

            setCustomItems((prev) => {
              const updated = { ...prev };
              delete updated[checkoutCustomerId];
              return updated;
            });

            setDiscounts((prev) => {
              const updated = { ...prev };
              delete updated[checkoutCustomerId];
              return updated;
            });

            setAdvanceAmounts((prev) => {
              const updated = { ...prev };
              delete updated[checkoutCustomerId];
              return updated;
            });

            setCheckoutCustomerId(null);
          }}
        />
      )}

      {/* Dialogs */}
      <AddCustomerDialog
        open={showAddCustomer}
        onOpenChange={setShowAddCustomer}
        customers={customers}
        selectedCustomers={selectedCustomers}
        onSelect={handleAddCustomer}
        onAddNew={handleAddNewCustomer}
      />

      <AddProductDialog
        open={showAddProduct}
        onOpenChange={setShowAddProduct}
        products={products}
        selectedProducts={selectedProducts}
        onSelect={handleAddProduct}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeConfirmation} onOpenChange={(open) => !open && setRemoveConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {removeConfirmation?.type === "customer" ? "Customer" : "Product"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removeConfirmation?.name}</strong>?
              <br />
              <br />
              This action cannot be undone. All selected quantities for this {removeConfirmation?.type} will be
              restocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeConfirmation?.type === "customer") {
                  handleRemoveCustomer(removeConfirmation.id);
                } else if (removeConfirmation?.type === "product") {
                  handleRemoveProduct(removeConfirmation.id);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
