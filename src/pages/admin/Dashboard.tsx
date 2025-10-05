import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, AlertCircle, LogOut, BarChart3, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";

interface CasaFe {
  id: string;
  nome_lider: string;
  campus: string;
  rede: string;
  endereco: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casasCount, setCasasCount] = useState(0);
  const [membrosCount, setMembrosCount] = useState(0);
  const [casasPendentes, setCasasPendentes] = useState<CasaFe[]>([]);
  const [crescimento, setCrescimento] = useState({ casas: 0, membros: 0 });

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

      // Calcular crescimento (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: casasRecentes } = await supabase
        .from("casas_fe")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { count: membrosRecentes } = await supabase
        .from("membros")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      const crescimentoCasas = casasTotal ? Math.round((casasRecentes || 0) / casasTotal * 100) : 0;
      const crescimentoMembros = membrosTotal ? Math.round((membrosRecentes || 0) / membrosTotal * 100) : 0;

      setCrescimento({ casas: crescimentoCasas, membros: crescimentoMembros });
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
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle pb-20">
      {/* Header Premium */}
      <header className="bg-card shadow-soft border-b sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo ao painel de controle
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Métricas Principais - Design Premium */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-7 h-7 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +{crescimento.casas}%
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{casasCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total de Casas de Fé</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +{crescimento.membros}%
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{membrosCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total de Membros</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-success" />
                </div>
                <div className="text-sm font-semibold text-muted-foreground">
                  Últimos 30d
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{casasPendentes.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Casas Recentes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-secondary" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">
                  {casasCount > 0 ? Math.round(membrosCount / casasCount) : 0}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Média Membros/Casa</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Button
            size="lg"
            onClick={() => navigate("/admin/casas")}
            className="h-20 text-lg gradient-primary hover:shadow-glow transition-all"
          >
            <Home className="w-6 h-6 mr-3" />
            Gerenciar Casas de Fé
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/membros")}
            className="h-20 text-lg hover:bg-accent/5 hover:border-accent transition-all"
          >
            <Users className="w-6 h-6 mr-3" />
            Ver Todos os Membros
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/relatorios")}
            className="h-20 text-lg hover:bg-success/5 hover:border-success transition-all"
          >
            <BarChart3 className="w-6 h-6 mr-3" />
            Relatórios & Analytics
          </Button>
        </div>

        {/* Últimas Casas Cadastradas */}
        <Card className="p-6 shadow-medium">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                Últimas Casas de Fé Cadastradas
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe as casas mais recentes
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/casas")}>
              Ver Todas
            </Button>
          </div>

          <div className="space-y-3">
            {casasPendentes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma casa cadastrada ainda</p>
              </div>
            ) : (
              casasPendentes.map((casa) => (
                <div
                  key={casa.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 cursor-pointer transition-all group"
                  onClick={() => navigate(`/admin/casas/${casa.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-glow">
                      {casa.nome_lider.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">
                        {casa.nome_lider}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Campus: <span className="font-semibold text-foreground">{casa.campus || 'N/A'}</span>
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Rede: <span className="font-semibold text-foreground">{casa.rede || 'N/A'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(casa.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
