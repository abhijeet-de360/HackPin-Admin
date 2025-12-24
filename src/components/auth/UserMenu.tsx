import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LogOut, Package, Users, Image, UserCog, Smartphone, ChevronDown, ChevronUp, Trophy, Tv, Plane, MessageCircle, Video, } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { adminLogout } from "@/store/authSlice";

export const UserMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const authVar = useSelector((state: RootState) => state.auth)
  const categoryVar = useSelector((state: RootState) => state.category)
  const getInitials = (name: string) => name?.trim()?.charAt(0).toUpperCase();
  const handleLogout = () => {
    setSheetOpen(false);
    dispatch(adminLogout(navigate))
  };
  const isActive = (path: string) => location.pathname === path;
  const categoryIconMap: Record<string, any> = {
    sports: Trophy,
    entertainment: Tv,
    travel: Plane,
    social: MessageCircle,
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger className="flex items-center focus:outline-none">
          <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-gray-300 transition-all bg-white">
            <AvatarFallback className="bg-white text-gray-600 font-bold text-sm">
              {getInitials(authVar.profile?.name)}
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
                {authVar.profile?.name}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {authVar.profile?.email}
              </p>
            </SheetHeader>
            <Separator />

            <div className="flex flex-col">

              <Link to={"/user"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/user") ? "bg-accent/50" : ""}`}>
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>

              <Link to={"/post"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/post") ? "bg-accent/50" : ""}`}>
                <Image className="mr-2 h-4 w-4" />
                Post
              </Link>

              <Link to={"/reels"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/reels") ? "bg-accent/50" : ""}`}>
                <Smartphone className="mr-2 h-4 w-4" />
                Reels
              </Link>

              <Link to={"/videos"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/videos") ? "bg-accent/50" : ""}`}>
                <Video className="mr-2 h-4 w-4" />
                Videos
              </Link>

              <Link to={"/challenge"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/challenge") ? "bg-accent/50" : ""}`}>
                <Package className="mr-2 h-4 w-4" />
                Challenge
              </Link>

              <Link to={"/team"} className={`flex items-center px-4 py-3 text-sm hover:bg-accent transition-colors text-left ${isActive("/team") ? "bg-accent/50" : ""}`}>
                <UserCog className="mr-2 h-4 w-4" />
                Team
              </Link>

              <span
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors cursor-pointer"
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
              </span>

              {categoryOpen && (
                <div className="flex flex-col bg-accent/20">
                  {categoryVar.categoryList?.map((item, index) => {
                    const Icon = categoryIconMap[item.name.toLowerCase()] || Trophy;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSheetOpen(false);
                          navigate(`/subcategory?id=${item._id}&type=${item.name}`);
                        }}
                        className={`flex items-center pl-10 pr-4 py-2.5 text-sm hover:bg-accent transition-colors text-left ${isActive(`/categories/${item._id}`) ? "bg-accent/50" : ""}`}                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <Separator />
            <div className="flex items-center  px-4 py-3 hover:bg-accent transition-colors text-left cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
