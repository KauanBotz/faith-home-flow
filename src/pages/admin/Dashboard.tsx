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
  dias_semana: string[];
  geracao: string;
}

interface CasaPendente extends CasaFe {
  dias_desde_reuniao: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casasCount, setCasasCount] = useState(0);
  const [membrosCount, setMembrosCount] = useState(0);
  const [casasRecentes, setCasasRecentes] = useState<CasaFe[]>([]);
  const [casasPendentesRelatorio, setCasasPendentesRelatorio] = useState<CasaPendente[]>([]);
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

      setCasasRecentes(casas || []);

      // Calcular casas pendentes de relatório
      if (casas) {
        const hoje = new Date();
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        const pendentes: CasaPendente[] = [];
        
        for (const casa of casas) {
          if (!casa.dias_semana || casa.dias_semana.length === 0) continue;
          
          const diaReuniaoNome = casa.dias_semana[0];
          const diaReuniaoIndex = diasSemana.indexOf(diaReuniaoNome);
          
          if (diaReuniaoIndex === -1) continue;
          
          // Calcular último dia de reunião
          const diaAtual = hoje.getDay();
          let diasDesdeReuniao = diaAtual - diaReuniaoIndex;
          if (diasDesdeReuniao < 0) diasDesdeReuniao += 7;
          
          if (diasDesdeReuniao > 0) {
            const ultimaReuniao = new Date(hoje);
            ultimaReuniao.setDate(hoje.getDate() - diasDesdeReuniao);
            
            // Verificar se existe relatório para a última reunião
            const { data: relatorio } = await supabase
              .from("relatorios")
              .select("*")
              .eq("casa_fe_id", casa.id)
              .eq("data_reuniao", ultimaReuniao.toISOString().split('T')[0])
              .maybeSingle();
            
            if (!relatorio) {
              pendentes.push({
                ...casa,
                dias_desde_reuniao: diasDesdeReuniao
              });
            }
          }
        }
        
        setCasasPendentesRelatorio(pendentes);
      }

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
                <p className="text-4xl font-bold mb-1">{casasRecentes.length}</p>
                <p className="text-sm text-muted-foreground font-medium">Casas Recentes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer" onClick={() => document.getElementById('casas-pendentes')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-destructive" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1 text-destructive">
                  {casasPendentesRelatorio.length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Relatórios Pendentes</p>
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

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Casas Pendentes de Relatório */}
          <Card className="p-6 shadow-medium" id="casas-pendentes">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                  Relatórios Pendentes
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Casas que não enviaram relatório após a reunião
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {casasPendentesRelatorio.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Todos os relatórios em dia! 🎉</p>
                </div>
              ) : (
                casasPendentesRelatorio.map((casa) => (
                  <div
                    key={casa.id}
                    className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl hover:bg-destructive/10 cursor-pointer transition-all group"
                    onClick={() => navigate(`/admin/casas/${casa.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive font-bold text-lg">
                        {casa.nome_lider.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg group-hover:text-destructive transition-colors">
                          {casa.nome_lider}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {casa.campus} {casa.rede && `- ${casa.rede}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-destructive font-semibold">
                      Há {casa.dias_desde_reuniao} {casa.dias_desde_reuniao === 1 ? 'dia' : 'dias'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Últimas Casas Cadastradas */}
          <Card className="p-6 shadow-medium">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  Casas Recentes
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimas casas cadastradas
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/admin/casas")}>
                Ver Todas
              </Button>
            </div>

            <div className="space-y-3">
              {casasRecentes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma casa cadastrada ainda</p>
                </div>
              ) : (
                casasRecentes.map((casa) => (
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
                            <span className="font-semibold text-foreground">{casa.geracao || 'Primeira'}</span>
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {casa.campus} {casa.rede && `- ${casa.rede}`}
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
