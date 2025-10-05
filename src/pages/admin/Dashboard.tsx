import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, AlertCircle, LogOut, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface CasaFe {
  id: string;
  nome_lider: string;
  campus: string;
  rede: string;
  endereco: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casasCount, setCasasCount] = useState(0);
  const [membrosCount, setMembrosCount] = useState(0);
  const [casasPendentes, setCasasPendentes] = useState<CasaFe[]>([]);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Ensure admin role exists for this user (SECURITY DEFINER)
      await supabase.rpc("ensure_admin_role");
      const { data: isAdminData, error } = await supabase.rpc("is_admin");
      
      if (error || !isAdminData) {
        toast.error("Acesso negado. Apenas administradores.");
        navigate("/login");
        return;
      }

      await loadDashboardData();
    } catch (error: any) {
      console.error("Auth check error:", error);
      navigate("/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      const { count: casasTotal } = await supabase
        .from("casas_fe")
        .select("*", { count: "exact", head: true });

      const { count: membrosTotal } = await supabase
        .from("membros")
        .select("*", { count: "exact", head: true });

      setCasasCount(casasTotal || 0);
      setMembrosCount(membrosTotal || 0);

      const { data: casas } = await supabase
        .from("casas_fe")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setCasasPendentes(casas || []);
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Casas</p>
                <p className="text-xl font-bold">{casasCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-xl font-bold">{membrosCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Casas Recentes</p>
                <p className="text-xl font-bold">{casasPendentes.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 mb-8">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate("/admin/casas")}
          >
            <Home className="w-5 h-5 mr-2" />
            Ver Todas as Casas de Fé
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/admin/membros")}
          >
            <Users className="w-5 h-5 mr-2" />
            Ver Todos os Membros
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/admin/relatorios")}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Gerar Relatórios
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Últimas Casas de Fé Cadastradas
          </h2>
          <div className="space-y-3">
            {casasPendentes.map((casa) => (
              <div
                key={casa.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => navigate(`/admin/casas/${casa.id}`)}
              >
                <div>
                  <p className="font-medium">{casa.nome_lider}</p>
                  <p className="text-sm text-muted-foreground">
                    {casa.campus} - {casa.rede}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
