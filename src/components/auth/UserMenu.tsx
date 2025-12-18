import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Lock,
  LogOut,
  Key,
  Package,
  Users,
  Settings,
  Image,
  UserCog,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Trophy,
  Tv,
  Plane,
  MessageCircle,
} from "lucide-react";
import { ChangePinDialog } from "./ChangePinDialog";

export const UserMenu = () => {
  const { currentUser, logout, lockApp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangePinDialog, setShowChangePinDialog] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);

  if (!currentUser) return null;

  const getInitials = (name: string) => name.trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    setSheetOpen(false);
    logout();
    navigate("/");
  };

  const handleLock = () => {
    setSheetOpen(false);
    lockApp();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger className="flex items-center focus:outline-none">
          <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-gray-300 transition-all bg-white">
            <AvatarFallback className="bg-white text-gray-600 font-bold text-sm">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-64 p-0 flex flex-col"
          showClose={false}
        >
          <div>
            <SheetHeader className="p-4 text-left">
              <SheetTitle className="text-sm font-medium">
                {currentUser.name}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </SheetHeader>
            <Separator />

            <div className="flex flex-col">
              <button
                onClick={() => navigate("/user")}
                className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${
                  isActive("/user") ? "bg-accent/50" : ""
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </button>

              <button
                onClick={() => navigate("/post")}
                className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${
                  isActive("/post") ? "bg-accent/50" : ""
                }`}
              >
                <Image className="mr-2 h-4 w-4" />
                Post
              </button>

              <button
                onClick={() => navigate("/reels")}
                className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${
                  isActive("/reels") ? "bg-accent/50" : ""
                }`}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Reels
              </button>

              <button
                onClick={() => navigate("/challenge")}
                className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${
                  isActive("/challenge") ? "bg-accent/50" : ""
                }`}
              >
                <Package className="mr-2 h-4 w-4" />
                Challenge
              </button>

              <button
                onClick={() => navigate("/team")}
                className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${
                  isActive("/team") ? "bg-accent/50" : ""
                }`}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Team
              </button>

              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors"
              >
                <span className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Categories
                </span>
                {categoryOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {categoryOpen && (
                <div className="flex flex-col bg-accent/20">
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      navigate("/category?type=sports");
                    }}
                    className={`flex items-center pl-10 pr-4 py-2.5 text-sm hover:bg-accent transition-colors text-left ${
                      isActive("/categories/sports") ? "bg-accent/50" : ""
                    }`}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Sports
                  </button>

                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      navigate("/category?type=entretainment");
                    }}
                    className={`flex items-center pl-10 pr-4 py-2.5 text-sm hover:bg-accent transition-colors text-left ${
                      isActive("/categories/entertainment")
                        ? "bg-accent/50"
                        : ""
                    }`}
                  >
                    <Tv className="mr-2 h-4 w-4" />
                    Entertainment
                  </button>

                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      navigate("/category?type=travel");
                    }}
                    className={`flex items-center pl-10 pr-4 py-2.5 text-sm hover:bg-accent transition-colors text-left ${
                      isActive("/categories/travel") ? "bg-accent/50" : ""
                    }`}
                  >
                    <Plane className="mr-2 h-4 w-4" />
                    Travel
                  </button>

                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      navigate("/category?type=social");
                    }}
                    className={`flex items-center pl-10 pr-4 py-2.5 text-sm hover:bg-accent transition-colors text-left ${
                      isActive("/categories/social") ? "bg-accent/50" : ""
                    }`}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Social
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <Separator />
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={handleLock}
                className="flex items-center text-sm hover:bg-accent px-2 py-1 rounded-md transition-colors"
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock Admin
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-2 hover:bg-accent rounded-md transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-48 p-0">
                  <div className="flex flex-col">
                    <button
                      onClick={() => setShowChangePinDialog(true)}
                      className="flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Change PIN
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-destructive text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ChangePinDialog
        open={showChangePinDialog}
        onOpenChange={setShowChangePinDialog}
      />
    </>
  );
};
