import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import SetupAdmin from "./pages/SetupAdmin";
import Dashboard from "./pages/Dashboard";
import Membros from "./pages/Membros";
import Presenca from "./pages/Presenca";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCasas from "./pages/admin/Casas";
import AdminCasaDetail from "./pages/admin/CasaDetail";
import AdminMembros from "./pages/admin/Membros";
import AdminRelatorios from "./pages/admin/Relatorios";
import Relatorio from "./pages/Relatorio";
import RelatoriosLeitura from "./pages/RelatoriosLeitura";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/membros" element={<Membros />} />
      <Route path="/presenca" element={<Presenca />} />
          <Route path="/relatorio" element={<Relatorio />} />
          <Route path="/relatorios" element={<RelatoriosLeitura />} />
      <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/casas" element={<AdminCasas />} />
          <Route path="/admin/casas/:id" element={<AdminCasaDetail />} />
          <Route path="/admin/membros" element={<AdminMembros />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
