import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Printer, Check, X, Download, Search, CalendarIcon, RotateCcw, FileText, CheckCheck, CircleCheck, CircleX } from "lucide-react";
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
import userData from "@/data/user.json";
import OrderPickList from "@/components/OrderPickList";
import { UserMenu } from "@/components/auth/UserMenu";
import hackpin_logo from "/hackpinpng.png";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Country, State, City } from "country-state-city";
import { getUserList } from "@/store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";












export default function User() {
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
  const [firstSelectedFilter, setFirstSelectedFilter] = useState<string | null>(
    null
  );
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkPrintOrders, setBulkPrintOrders] = useState<Order[]>([]);
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

  const [formData, setFormData] = useState({
    limit: '',
    offset: '',
    keyword: '',
    status: '',
    country: '',
    state: '',
    city: '',
  })

  const dispatch = useDispatch<AppDispatch>();
  const userVar = useSelector((state: RootState) => state.user)

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  
  // useEffect(() => {
  //   console.log("first")
  //   setCities(City.getCitiesOfState(formData.country, formData.state))
  // }, [formData?.state])


  const hnadleStateChange = (value) => {
    
    setFormData({ ...formData, state: value })
  }




  useEffect(() => {
    dispatch(getUserList(formData.limit, formData.offset, formData.keyword, formData?.status, formData.country, formData.state, formData.city))
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
          order.created_by.toLowerCase().includes(query)
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
      filtered = filtered.filter(
        (order) => order.created_by === createdByFilter
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (order) => (order.type || "Online") === typeFilter
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.payment_status === paymentFilter
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(
        (order) => new Date(order.created_at) >= fromDate
      );
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (order) => new Date(order.created_at) <= toDate
      );
    }

    // Sort by created_at descending
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setFilteredOrders(filtered);
    setDisplayCount(20);
  }, [
    orders,
    searchQuery,
    groupFilter,
    marketerFilter,
    statusFilter,
    createdByFilter,
    typeFilter,
    paymentFilter,
    dateFrom,
    dateTo,
  ]);


  useEffect(() => {
    filterOrders();
  }, [filterOrders]);



  const getUniqueCreatedBy = () => {
    // If this is the first selected filter, show all employees. Otherwise, show only available ones from filtered results
    const source =
      firstSelectedFilter === "createdBy" ? orders : filteredOrders;
    const uniqueEmployees = Array.from(
      new Set(source.map((order) => order.created_by))
    );
    return uniqueEmployees;
  };

  const getUniqueMarketers = () => {
    // If this is the first selected filter, show all marketers. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "marketer" ? orders : filteredOrders;
    const uniqueMarketers = Array.from(
      new Set(source.map((order) => order.marketer).filter(Boolean))
    );
    return uniqueMarketers as string[];
  };
  const getUniqueStatuses = () => {
    // If this is the first selected filter, show all statuses. Otherwise, show only available ones from filtered results
    const source = firstSelectedFilter === "status" ? orders : filteredOrders;
    const uniqueStatuses = Array.from(
      new Set(source.map((order) => order.status))
    );
    return uniqueStatuses;
  };


  const getStatusBadge = (status: Order["status"]) => {
    const colors = {
      active: "text-green-600 text-sm",
      suspended: "text-red-600 text-sm",
    };
    return (
      <span className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };


  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        if (displayCount < filteredOrders.length) {
          setDisplayCount((prev) => Math.min(prev + 20, filteredOrders.length));
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredOrders.length]);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img className="w-28" src={hackpin_logo} />
            {selectedOrders.size > 0 && (
              <span className="text-lg font-semibold text-primary">
                {selectedOrders.size}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">

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

            <Select
              value={formData?.country}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  country: value,
                }))
              }

            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country?.isoCode} value={country?.isoCode}>
                    {country?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.state}
              onValueChange={(value) => hnadleStateChange(value)}
            >
              <SelectTrigger className="w-[140px]" disabled={!formData?.country}>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state,index) => (
                  <SelectItem key={index} value={state?.isoCode}>
                    {state?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData?.city}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  city: value,
                }))
              }
            >
              <SelectTrigger className="w-[140px]" disabled={!formData?.state}>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city, index) => (
                  <SelectItem key={index} value={city}>
                    {city?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={createdByFilter}
              onValueChange={(value) => {
                if (!firstSelectedFilter && value !== "all") {
                  setFirstSelectedFilter("createdBy");
                } else if (
                  value === "all" &&
                  firstSelectedFilter === "createdBy"
                ) {
                  // Check if any other filter is selected
                  if (
                    groupFilter === "all" &&
                    marketerFilter === "all" &&
                    statusFilter === "all" &&
                    typeFilter === "all" &&
                    paymentFilter === "all"
                  ) {
                    setFirstSelectedFilter(null);
                  } else {
                    // Find the next selected filter
                    if (groupFilter !== "all") setFirstSelectedFilter("group");
                    else if (marketerFilter !== "all")
                      setFirstSelectedFilter("marketer");
                    else if (
                      statusFilter !== "all" &&
                      statusFilter !== "not-printed"
                    )
                      setFirstSelectedFilter("status");
                    else if (typeFilter !== "all")
                      setFirstSelectedFilter("type");
                    else if (paymentFilter !== "all")
                      setFirstSelectedFilter("payment");
                  }
                }
                setCreatedByFilter(value);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Created By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">City</SelectItem>
                {getUniqueCreatedBy().map((employee) => (
                  <SelectItem key={employee} value={employee}>
                    {employee}
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

        {userVar?.totalUser === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            No User found
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        User Id
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        State
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Video
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Reels
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Challenges
                      </th>


                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {userVar?.userList?.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/30">

                        <td
                          className="px-4 py-3 text-sm font-medium cursor-pointer text-primary hover:underline"
                          onClick={() => navigate(`/user/${user?._id}`)}
                        >
                          {user?.userId}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {!user?.isSubscribed ? 'Regular' : "Pro"}
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user?.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user?.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.country}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.city}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user?.totalPost}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user?.totalVideo}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user?.totalReels}
                        </td>
                        <td className="px-4 py-3 text-sm">{user?.totalChallenges}</td>


                        <td className="px-4 py-3 text-left">
                          {getStatusBadge(user?.status)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {user?.status === 'active' ? (
                              <button
                                onClick={() => setDeactivationModalOpen(true)}
                              >
                                <CircleX />
                              </button>
                            ) : (
                              <button
                                onClick={() => setActivationModalOpen(true)}
                              >
                                <CircleCheck className="" />
                              </button>
                            )}
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
                Showing {displayCount} of {filteredOrders.length} orders •
                Scroll for more
              </div>
            )}
            {displayCount >= filteredOrders.length &&
              filteredOrders.length > 20 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Showing all {filteredOrders.length} orders
                </div>
              )}
          </>
        )}
      </div>
      <Dialog open={activationModalOpen} onOpenChange={setActivationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept order?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to accept this order?</p>
          <div className="flex gap-2 mt-4">
            <Button
              className="bg-primary"
              onClick={() => setActivationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-green-500 text-white" variant="user">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivation Modal */}
      <Dialog
        open={deactivationModalOpen}
        onOpenChange={setDeactivationModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to reject this order?</p>
          <div className="flex gap-2 mt-4">
            <Button
              className="bg-primary"
              onClick={() => setDeactivationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-red-500 text-white" variant="user">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
