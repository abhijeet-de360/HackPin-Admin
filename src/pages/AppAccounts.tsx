import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Search, Download, Check, X, User, Phone, Calendar, Clock, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AppAccountRequest, AppAccountStatus } from "@/types";
import appAccountsData from "@/data/app-accounts.json";
import { toast } from "sonner";
import { UserMenu } from "@/components/auth/UserMenu";
export default function AppAccounts() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AppAccountRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AppAccountRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(50);
  const [selectedRequest, setSelectedRequest] = useState<AppAccountRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  useEffect(() => {
    const data = appAccountsData as AppAccountRequest[];
    console.log("Loading app accounts data:", data.length, "requests");
    setRequests(data);
  }, []);
  const filterRequests = useCallback(() => {
    let filtered = [...requests];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => req.request_id.toLowerCase().includes(query) || req.customer_name.toLowerCase().includes(query) || req.customer_phone.toLowerCase().includes(query) || req.customer_id.toLowerCase().includes(query));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    filtered.sort((a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime());
    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);
  useEffect(() => {
    filterRequests();
  }, [filterRequests]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDisplayCount(prev => Math.min(prev + 50, filteredRequests.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredRequests.length]);
  const getStatusBadge = (status: AppAccountStatus) => {
    const variants: Record<AppAccountStatus, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = currentRequests.filter(req => req.status === 'pending').map(req => req.id);
      setSelectedRequests(pendingIds);
    } else {
      setSelectedRequests([]);
    }
  };
  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };
  const handleBulkAccept = () => {
    const updatedRequests = requests.map(req => selectedRequests.includes(req.id) && req.status === 'pending' ? {
      ...req,
      status: 'accepted' as AppAccountStatus,
      reviewed_by: 'current-user',
      reviewed_by_name: 'Current User',
      reviewed_at: new Date().toISOString()
    } : req);
    setRequests(updatedRequests);
    setSelectedRequests([]);
    toast.success(`${selectedRequests.length} request(s) accepted`);
  };
  const handleBulkReject = () => {
    const updatedRequests = requests.map(req => selectedRequests.includes(req.id) && req.status === 'pending' ? {
      ...req,
      status: 'rejected' as AppAccountStatus,
      reviewed_by: 'current-user',
      reviewed_by_name: 'Current User',
      reviewed_at: new Date().toISOString()
    } : req);
    setRequests(updatedRequests);
    setSelectedRequests([]);
    toast.success(`${selectedRequests.length} request(s) rejected`);
  };
  const exportToCSV = () => {
    const headers = ["Request ID", "Customer ID", "Customer Name", "Customer Phone", "GST Number", "Request Date", "Request Time", "Status", "Reviewed By", "Reviewed At"];
    const csvData = filteredRequests.map(req => [req.request_id, req.customer_id, req.customer_name, req.customer_phone, req.gst_number || "-", req.request_date, req.request_time, req.status, req.reviewed_by_name || "-", req.reviewed_at ? format(new Date(req.reviewed_at), "dd/MM/yy, h:mm a") : "-"]);
    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-accounts-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };
  const handleRequestClick = (request: AppAccountRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };
  const handleAcceptRequest = () => {
    if (!selectedRequest) return;
    const updatedRequests = requests.map(req => req.id === selectedRequest.id && req.status === 'pending' ? {
      ...req,
      status: 'accepted' as AppAccountStatus,
      reviewed_by: 'current-user',
      reviewed_by_name: 'Current User',
      reviewed_at: new Date().toISOString()
    } : req);
    setRequests(updatedRequests);
    setDetailDialogOpen(false);
    toast.success("Request accepted successfully");
  };
  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    const updatedRequests = requests.map(req => req.id === selectedRequest.id && req.status === 'pending' ? {
      ...req,
      status: 'rejected' as AppAccountStatus,
      reviewed_by: 'current-user',
      reviewed_by_name: 'Current User',
      reviewed_at: new Date().toISOString()
    } : req);
    setRequests(updatedRequests);
    setDetailDialogOpen(false);
    toast.success("Request rejected successfully");
  };
  const currentRequests = filteredRequests.slice(0, displayCount);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">App's Accounts</h1>
            {selectedRequests.length > 0 && <span className="text-lg font-semibold text-primary">
                {selectedRequests.length}
              </span>}
          </div>
          <div className="flex items-center gap-2">
            {selectedRequests.length > 0 && <>
                <Button onClick={handleBulkAccept} size="icon" variant="outline" className="bg-white" title="Accept selected requests">
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button onClick={handleBulkReject} size="icon" variant="outline" className="bg-white" title="Reject selected requests">
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>}
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by request ID, customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRequests.length === 0 ? <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            No app account requests found
          </div> : <>
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-12">
                        <Checkbox checked={selectedRequests.length === currentRequests.filter(r => r.status === 'pending').length && currentRequests.filter(r => r.status === 'pending').length > 0} onCheckedChange={handleSelectAll} />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Request ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Customer ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Contact Person</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Business Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">GST Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Request At</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reviewed By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reviewed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentRequests.map(request => <tr key={request.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-center">
                          <Checkbox checked={selectedRequests.includes(request.id)} onCheckedChange={checked => handleSelectRequest(request.id, checked as boolean)} disabled={request.status !== 'pending'} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <button onClick={() => handleRequestClick(request)} className="text-primary hover:underline cursor-pointer">
                            {request.request_id}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">{request.customer_id}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <p>{request.customer_name}</p>
                          <small className="text-muted-foreground">{request.customer_phone}</small>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">XYZ</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{request.gst_number || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">Kolkata, West Bengal</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <p>{request.request_date}</p> 
                          <small>{request.request_time}</small>
                          </td>
                        <td className="px-4 py-3 text-left text-sm capitalize">{request?.status}</td>
                        <td className="px-4 py-3 text-sm">{request.reviewed_by_name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <p>{request.request_date}</p> 
                          <small>{request.request_time}</small>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infinite Scroll Indicator */}
            {currentRequests.length < filteredRequests.length && <div className="text-center py-4 text-sm text-muted-foreground">
                Showing {currentRequests.length} of {filteredRequests.length} requests • Scroll for more
              </div>}
            {currentRequests.length >= filteredRequests.length && filteredRequests.length > 0 && <div className="text-center py-4 text-sm text-muted-foreground">
                Showing all {filteredRequests.length} requests
              </div>}
          </>}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          

          {selectedRequest && <div className="space-y-6">
              {/* Request Information */}
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Request Information</h3>
                  {selectedRequest.status && <Badge variant={selectedRequest.status === "accepted" ? "default" : selectedRequest.status === "rejected" ? "destructive" : "secondary"}>
                      {selectedRequest.status}
                    </Badge>}
                </div>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Request ID</p>
                      <p className="text-sm font-medium">{selectedRequest.request_id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Request Date</p>
                      <p className="text-sm font-medium">{selectedRequest.request_date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Request Time</p>
                      <p className="text-sm font-medium">{selectedRequest.request_time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Customer ID</p>
                      <p className="text-sm font-medium">{selectedRequest.customer_id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="text-sm font-medium">{selectedRequest.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="text-sm font-medium">{selectedRequest.customer_phone}</p>
                    </div>
                  </div>
                  {selectedRequest.gst_number && <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">GST Number</p>
                        <p className="text-sm font-medium">{selectedRequest.gst_number}</p>
                      </div>
                    </div>}
                </div>
              </div>

              {/* Review Information */}
              {selectedRequest.reviewed_by && <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Information</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Reviewed By</p>
                        <p className="text-sm font-medium">{selectedRequest.reviewed_by_name || "-"}</p>
                      </div>
                    </div>
                    {selectedRequest.reviewed_at && <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Reviewed At</p>
                          <p className="text-sm font-medium">
                            {format(new Date(selectedRequest.reviewed_at), "dd/MM/yy, h:mm a")}
                          </p>
                        </div>
                      </div>}
                  </div>
                </div>}
            </div>}

          <DialogFooter>
            {selectedRequest?.status === 'pending' && <div className="flex gap-2">
                <Button variant="outline" onClick={handleRejectRequest}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleAcceptRequest}>
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
              </div>}
            {selectedRequest?.status !== 'pending' && <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}