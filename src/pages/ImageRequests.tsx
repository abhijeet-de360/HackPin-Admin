import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInHours } from "date-fns";
import {
  ArrowLeft,
  Search,
  Download,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageViewRequest, ImageRequestStatus } from "@/types";
import imageRequestsData from "@/data/image-requests.json";
import { toast } from "sonner";
import { UserMenu } from "@/components/auth/UserMenu";

export default function ImageRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ImageViewRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ImageViewRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(50);

  useEffect(() => {
    setRequests(imageRequestsData as ImageViewRequest[]);
  }, []);

  const filterRequests = useCallback(() => {
    let filtered = [...requests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.request_id.toLowerCase().includes(query) ||
          req.customer_name.toLowerCase().includes(query) ||
          req.customer_phone.toLowerCase().includes(query) ||
          req.customer_id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    filtered.sort((a, b) => 
      new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
    );

    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setDisplayCount((prev) => Math.min(prev + 50, filteredRequests.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredRequests.length]);

  const getStatusBadge = (status: ImageRequestStatus) => {
    return <p className="capitalize text-sm">{status}</p>;
  };

  const formatLastRequest = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hoursDiff = differenceInHours(now, date);

    if (hoursDiff < 24) {
      return `${hoursDiff} hrs ago`;
    } else {
      return format(date, "dd/MM/yy, h:mm a");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = currentRequests
        .filter(req => req.status === 'pending')
        .map(req => req.id);
      setSelectedRequests(pendingIds);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter((id) => id !== requestId));
    }
  };

  const handleBulkAccept = () => {
    const updatedRequests = requests.map((req) =>
      selectedRequests.includes(req.id) && req.status === 'pending'
        ? { 
            ...req, 
            status: 'accepted' as ImageRequestStatus,
            reviewed_by: 'current-user',
            reviewed_by_name: 'Current User',
            reviewed_at: new Date().toISOString()
          }
        : req
    );
    setRequests(updatedRequests);
    setSelectedRequests([]);
    toast.success(`${selectedRequests.length} request(s) accepted`);
  };

  const handleBulkReject = () => {
    const updatedRequests = requests.map((req) =>
      selectedRequests.includes(req.id) && req.status === 'pending'
        ? { 
            ...req, 
            status: 'rejected' as ImageRequestStatus,
            reviewed_by: 'current-user',
            reviewed_by_name: 'Current User',
            reviewed_at: new Date().toISOString()
          }
        : req
    );
    setRequests(updatedRequests);
    setSelectedRequests([]);
    toast.success(`${selectedRequests.length} request(s) rejected`);
  };

  const exportToCSV = () => {
    const headers = [
      "Request ID",
      "Customer ID",
      "Customer Name",
      "Customer Phone",
      "Requests Today",
      "Request Date",
      "Last Request Date",
      "Status",
      "Reviewed By",
      "Reviewed At",
    ];

    const csvData = filteredRequests.map((req) => [
      req.request_id,
      req.customer_id,
      req.customer_name,
      req.customer_phone,
      req.requests_today,
      format(new Date(req.request_date), "PPpp"),
      format(new Date(req.last_request_date), "PPpp"),
      req.status,
      req.reviewed_by_name || "-",
      req.reviewed_at ? format(new Date(req.reviewed_at), "PPpp") : "-",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-requests-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const currentRequests = filteredRequests.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Image View Requests</h1>
            {selectedRequests.length > 0 && (
              <span className="text-lg font-semibold text-primary">
                {selectedRequests.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedRequests.length > 0 && (
              <>
                <Button
                  onClick={handleBulkAccept}
                  size="icon"
                  variant="outline"
                  className="bg-white"
                  title="Accept selected requests"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  onClick={handleBulkReject}
                  size="icon"
                  variant="outline"
                  className="bg-white"
                  title="Reject selected requests"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
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
              <Input
                placeholder="Search by request ID, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
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

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            No image requests found
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold w-12">
                        <Checkbox
                          checked={selectedRequests.length === currentRequests.filter(r => r.status === 'pending').length && currentRequests.filter(r => r.status === 'pending').length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Request ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Customer ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Customer Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Requests Today</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Request Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Last Request</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reviewed By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reviewed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={(checked) =>
                              handleSelectRequest(request.id, checked as boolean)
                            }
                            disabled={request.status !== 'pending'}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{request.request_id}</td>
                        <td className="px-4 py-3 text-sm">{request.customer_id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{request.customer_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{request.customer_phone}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline">{request.requests_today}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {format(new Date(request.request_date), "dd/MM/yy, h:mm a")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatLastRequest(request.last_request_date)}
                        </td>
                        <td className="px-4 py-3 text-left">{getStatusBadge(request.status)}</td>
                        <td className="px-4 py-3 text-sm">{request.reviewed_by_name || "-"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {request.reviewed_at
                            ? format(new Date(request.reviewed_at), "dd/MM/yy, h:mm a")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Infinite Scroll Indicator */}
            {displayCount < filteredRequests.length && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing {displayCount} of {filteredRequests.length} requests • Scroll for more
              </div>
            )}
            {displayCount >= filteredRequests.length && filteredRequests.length > 50 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing all {filteredRequests.length} requests
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
