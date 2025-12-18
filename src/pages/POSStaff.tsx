import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import posStaffData from "@/data/pos-staff.json";
import { TeamMember } from "@/types";
import { EditPOSStaffModal } from "@/components/pos-staff/EditPOSStaffModal";
import { AddPOSStaffDialog } from "@/components/pos-staff/AddPOSStaffDialog";
import { useToast } from "@/hooks/use-toast";

const POSStaff = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState<TeamMember[]>(posStaffData as TeamMember[]);
  const [displayCount, setDisplayCount] = useState(50);
  const members = staffList;

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    
    const query = searchQuery.toLowerCase();
    return members.filter((member) =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.phone.includes(query) ||
      member.role.toLowerCase().includes(query) ||
      (member.department && member.department.toLowerCase().includes(query)) ||
      member.id.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        if (displayCount < filteredMembers.length) {
          setDisplayCount((prev) => Math.min(prev + 50, filteredMembers.length));
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredMembers.length]);

  // Display members based on scroll position
  const visibleMembers = filteredMembers.slice(0, displayCount);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(members.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    }
  };

  const handleSaveMember = (updatedMember: TeamMember) => {
    setStaffList(staffList.map(m => m.id === updatedMember.id ? updatedMember : m));
    toast({
      title: "POS staff member updated",
      description: "POS staff member details have been saved successfully",
    });
    setEditingMember(null);
  };

  const handleAddNewMember = (newMember: TeamMember) => {
    setStaffList([...staffList, newMember]);
    toast({
      title: "POS staff member added",
      description: `${newMember.name} has been added successfully`,
    });
  };

  const handleDeleteMembers = () => {
    const updatedList = staffList.map(member => 
      selectedMembers.includes(member.id) 
        ? { ...member, status: 'deleted' as const }
        : member
    );
    setStaffList(updatedList);
    toast({
      title: "POS staff members deleted",
      description: `${selectedMembers.length} member(s) marked as deleted`,
    });
    setSelectedMembers([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">POS Staff</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search POS staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {selectedMembers.length > 0 && (
              <Button 
                onClick={handleDeleteMembers} 
                size="icon"
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              onClick={() => setAddMemberDialogOpen(true)}
              className="bg-black text-white hover:bg-black/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
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
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0} 
                      onCheckedChange={handleSelectAll} 
                    />
                  </div>
                </TableHead>
                <TableHead className="w-32">Member ID</TableHead>
                <TableHead className="w-48">Name</TableHead>
                <TableHead className="w-48">Email</TableHead>
                <TableHead className="w-32">Phone</TableHead>
                <TableHead className="w-40">Role</TableHead>
                <TableHead className="w-32">Department</TableHead>
                <TableHead className="w-64">Last Login</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.map((member) => {
                const isDeleted = member.status === 'deleted';
                return (
                  <TableRow 
                    key={member.id}
                    className={isDeleted ? 'opacity-50 bg-muted/30' : ''}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                          disabled={isDeleted}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-primary hover:text-primary/80"
                        onClick={() => !isDeleted && setEditingMember(member)}
                        disabled={isDeleted}
                      >
                        {member.id}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.department || '-'}</TableCell>
                    <TableCell className="text-xs">
                      12/05/2024 04:23 PM
                    </TableCell>
                    <TableCell>
                      <p className={`capitalize`}  >
                        {member.status}
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibleMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No POS staff members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Infinite Scroll Indicator */}
          {displayCount < filteredMembers.length && (
            <div className="text-center py-4 text-sm text-muted-foreground border-t">
              Showing {displayCount} of {filteredMembers.length} POS staff members • Scroll for more
            </div>
          )}
          {displayCount >= filteredMembers.length && filteredMembers.length > 50 && (
            <div className="text-center py-4 text-sm text-muted-foreground border-t">
              Showing all {filteredMembers.length} POS staff members
            </div>
          )}
        </div>
      </div>

      <EditPOSStaffModal
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSave={handleSaveMember}
      />

      {/* Add Dialog */}
      <AddPOSStaffDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onAddNew={handleAddNewMember}
      />
    </div>
  );
};

export default POSStaff;
