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
import Category from "./pages/Category";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/user" element={<User />} />
          <Route path="/user/:userId" element={<UserDetails />} />
          <Route path="/post" element={<Post />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/team" element={<Team />} />
          <Route path="/category" element={<Category />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
