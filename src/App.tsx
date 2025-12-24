import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";

import NotFound from "./pages/NotFound";
import User from "./pages/User";
import UserDetails from "./pages/UserDetails";
import Post from "./pages/Post";
import Reels from "./pages/Reels";
import Challenge from "./pages/Challenge";
import Team from "./pages/Team";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { useEffect } from "react";
import { getAdminProfile } from "./store/authSlice";
import { getCategoryList } from "./store/categorySlice";
import SubCategory from "./pages/SubCategory";
import Video from "./pages/Video";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authVar = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (authVar?.isAuthenticated) {
      dispatch(getAdminProfile())
      dispatch(getCategoryList())
    }
  }, [dispatch, authVar?.isAuthenticated])

  return (

    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/user" element={<User />} />
          <Route path="/user/:userId" element={<UserDetails />} />
          <Route path="/post" element={<Post />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/videos" element={<Video />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/team" element={<Team />} />
          <Route path="/subcategory" element={<SubCategory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  )
}


export default App;
