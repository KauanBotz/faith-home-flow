import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, AlertCircle, LogOut, BarChart3, TrendingUp, Activity, Heart, UserCheck, MessageCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface CasaFe {
  id: string;
  nome_lider: string;
  telefone: string;
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
  const [crescimento, setCrescimento] = useState({ casas: 0, membros: 0, aceitouJesus: 0, reconciliou: 0 });
  const [aceitouJesusCount, setAceitouJesusCount] = useState(0);
  const [reconciliouCount, setReconciliouCount] = useState(0);
  const [casasPorCampus, setCasasPorCampus] = useState<any[]>([]);
  const [evolucaoMembros, setEvolucaoMembros] = useState<any[]>([]);

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

      const { data: membrosData, count: membrosTotal } = await supabase
        .from("membros")
        .select("*", { count: "exact" });

      setCasasCount(casasTotal || 0);
      setMembrosCount(membrosTotal || 0);

      // Contar aceitou jesus e reconciliou
      const aceitouCount = (membrosData || []).filter(m => m.aceitou_jesus).length;
      const reconciliouCount = (membrosData || []).filter(m => m.reconciliou_jesus).length;
      setAceitouJesusCount(aceitouCount);
      setReconciliouCount(reconciliouCount);

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
            
            if (!relatorio || !relatorio.notas) {
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

      // Crescimento de conversões (últimos 30 dias)
      const { count: aceitouRecentes } = await supabase
        .from("membros")
        .select("*", { count: "exact", head: true })
        .eq("aceitou_jesus", true)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { count: reconciliouRecentes } = await supabase
        .from("membros")
        .select("*", { count: "exact", head: true })
        .eq("reconciliou_jesus", true)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const crescimentoAceitou = aceitouCount ? Math.round((aceitouRecentes || 0) / aceitouCount * 100) : 0;
      const crescimentoReconciliou = reconciliouCount ? Math.round((reconciliouRecentes || 0) / reconciliouCount * 100) : 0;

      setCrescimento({ 
        casas: crescimentoCasas, 
        membros: crescimentoMembros,
        aceitouJesus: crescimentoAceitou,
        reconciliou: crescimentoReconciliou
      });

      // Processar dados para gráficos
      await loadChartData();
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      // Casas por campus
      const { data: todasCasas } = await supabase
        .from("casas_fe")
        .select("campus");
      
      if (todasCasas) {
        const campusCount: Record<string, number> = {};
        todasCasas.forEach((casa) => {
          campusCount[casa.campus] = (campusCount[casa.campus] || 0) + 1;
        });
        
        const casasPorCampusData = Object.entries(campusCount).map(([campus, count]) => ({
          campus,
          total: count
        })).sort((a, b) => b.total - a.total);
        
        setCasasPorCampus(casasPorCampusData);
      }

      // Evolução de membros - do dia 20/10 até 14/11
      const dataInicio = new Date('2024-10-20');
      const dataFim = new Date('2024-11-14');
      
      // Buscar todos os membros criados nesse período
      const { data: membrosPeriodo } = await supabase
        .from("membros")
        .select("created_at")
        .gte("created_at", dataInicio.toISOString())
        .lte("created_at", dataFim.toISOString())
        .order("created_at");
      
      // Gerar as semanas do período
      const semanasOrdenadas: { inicio: Date; label: string }[] = [];
      let dataAtual = new Date(dataInicio);
      
      while (dataAtual <= dataFim) {
        const label = `${dataAtual.getDate().toString().padStart(2, '0')}/${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
        semanasOrdenadas.push({ inicio: new Date(dataAtual), label });
        dataAtual.setDate(dataAtual.getDate() + 7);
      }
      
      // Contar membros acumulados até cada semana
      if (membrosPeriodo) {
        const { count: totalMembrosAteInicio } = await supabase
          .from("membros")
          .select("*", { count: "exact", head: true })
          .lte("created_at", dataInicio.toISOString());
        
        let acumulado = totalMembrosAteInicio || 0;
        
        const evolucaoData = semanasOrdenadas.map(({ inicio, label }) => {
          const fimSemana = new Date(inicio);
          fimSemana.setDate(inicio.getDate() + 7);
          
          const membrosNaSemana = (membrosPeriodo || []).filter(m => {
            const dataCriacao = new Date(m.created_at);
            return dataCriacao >= inicio && dataCriacao < fimSemana;
          }).length;
          
          acumulado += membrosNaSemana;
          
          return {
            semana: label,
            membros: acumulado
          };
        });
        
        setEvolucaoMembros(evolucaoData);
      } else {
        setEvolucaoMembros([]);
      }
    } catch (error: any) {
      console.error("Error loading chart data:", error);
      toast.error("Erro ao carregar gráficos");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo! Graça e Paz.");
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
          <div className="flex items-center gap-3">
            <img src="../favicon.png" alt="" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo ao painel de controle
              </p>
            </div>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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
                  Últimos 14 dias
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

        {/* Métricas de Conversão */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +{crescimento.aceitouJesus}%
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{aceitouJesusCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total - Aceitaram Jesus</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-success" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +{crescimento.reconciliou}%
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{reconciliouCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total - Reconciliaram</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos de Análise */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Gráfico de Casas por Campus */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              Casas por Campus
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={casasPorCampus}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="campus" angle={-45} textAnchor="end" height={100} className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Casas de Fé" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Evolução de Membros */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" />
              Evolução de Membros (20/10 - 14/11)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMembros}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="semana" angle={-45} textAnchor="end" height={80} className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="Total de Membros"
                  dot={{ fill: 'hsl(var(--accent))', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
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

          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-20 text-base hover:bg-accent/5 hover:border-accent transition-all px-3"
          >
            <a href="/instrucoes-casa-de-fe.pdf" download="Instrucoes_Casa_de_Fe.pdf" className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-normal text-center leading-tight">Instruções<br />Casa de Fé</span>
            </a>
          </Button>
        </div>

        {/* Casas Pendentes de Relatório */}
        <Card className="p-6 shadow-medium mb-8" id="casas-pendentes">
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
                    className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl transition-all"
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/admin/casas/${casa.id}`)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive font-bold text-lg">
                        {casa.nome_lider.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {casa.nome_lider}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {casa.campus} {casa.rede && `- ${casa.rede}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-destructive font-semibold text-right">
                        Há {casa.dias_desde_reuniao} {casa.dias_desde_reuniao === 1 ? 'dia' : 'dias'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const mensagem = encodeURIComponent(`Olá ${casa.nome_lider.split(' ')[0]}! Notamos que o relatório da última reunião ainda não foi preenchido. Poderia preencher quando tiver um momento? Obrigado! 🙏`);
                          window.open(`https://wa.me/55${casa.telefone?.replace(/\D/g, '')}?text=${mensagem}`, '_blank');
                        }}
                        className="gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
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
