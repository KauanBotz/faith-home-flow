import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, LogOut, User, MapPin, Clock, Sparkles, TrendingUp, FileText, Heart, UserCheck, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [membrosCount, setMembrosCount] = useState(0);
  const [aceitouJesusCount, setAceitouJesusCount] = useState(0);
  const [reconciliouCount, setReconciliouCount] = useState(0);
  const [membrosData, setMembrosData] = useState<any[]>([]);
  const [presencasData, setPresencasData] = useState<any[]>([]);
  const [relatoriosPendentes, setRelatoriosPendentes] = useState(0);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: casaData, error: casaError } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (casaError) throw casaError;
      setCasaFe(casaData);

      if (casaData) {
        const { data: membrosData, count } = await supabase
          .from("membros")
          .select("*", { count: "exact" })
          .eq("casa_fe_id", casaData.id);
        
        setMembrosCount(count || 0);
        setMembrosData(membrosData || []);

        // Contar aceitou jesus e reconciliou
        const aceitouCount = (membrosData || []).filter(m => m.aceitou_jesus).length;
        const reconciliouCount = (membrosData || []).filter(m => m.reconciliou_jesus).length;
        setAceitouJesusCount(aceitouCount);
        setReconciliouCount(reconciliouCount);

        // Buscar presenças
        const membroIds = (membrosData || []).map(m => m.id);
        if (membroIds.length > 0) {
          const { data: presencasData } = await supabase
            .from("presencas")
            .select("*")
            .in("membro_id", membroIds)
            .order("data_reuniao", { ascending: false });
          
          setPresencasData(presencasData || []);
        }

        // Verificar relatórios pendentes: presenças marcadas sem relatório correspondente
        const { data: presencas } = await supabase
          .from("presencas")
          .select("data_reuniao")
          .in("membro_id", membroIds)
          .order("data_reuniao", { ascending: false });

        if (presencas && presencas.length > 0) {
          // Pegar datas únicas
          const datasPresenca = [...new Set(presencas.map(p => p.data_reuniao))];
          
          // Verificar quais datas têm relatório
          const { data: relatorios } = await supabase
            .from("relatorios")
            .select("data_reuniao")
            .eq("casa_fe_id", casaData.id);

          const datasComRelatorio = relatorios?.map(r => r.data_reuniao) || [];
          
          // Contar quantas datas têm presença mas não têm relatório
          const pendentes = datasPresenca.filter(
            data => !datasComRelatorio.includes(data)
          ).length;
          
          setRelatoriosPendentes(pendentes);
        } else {
          setRelatoriosPendentes(0);
        }
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/login");
  };

  const getMembrosFrequenciaData = () => {
    return membrosData.map(membro => {
      const presencasMembro = presencasData.filter(p => p.membro_id === membro.id);
      const presencas = presencasMembro.filter(p => p.presente).length;
      const faltas = presencasMembro.filter(p => !p.presente).length;
      
      return {
        nome: membro.nome_completo.split(' ')[0],
        presencas,
        faltas,
      };
    }).sort((a, b) => b.presencas - a.presencas);
  };

  const getMembrosComStatus = () => {
    return membrosData.map(membro => {
      const presencasMembro = presencasData.filter(p => p.membro_id === membro.id);
      const ultimasPresencas = presencasMembro.slice(0, 3); // Últimas 3 reuniões
      const faltasRecentes = ultimasPresencas.filter(p => !p.presente).length;
      const presencasTotal = presencasMembro.filter(p => p.presente).length;
      
      return {
        ...membro,
        presencasTotal,
        faltasRecentes,
      };
    }).sort((a, b) => b.faltasRecentes - a.faltasRecentes);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary animate-pulse shadow-glow" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Header Premium */}
      <header className="bg-card/95 backdrop-blur-sm shadow-soft border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Minha Casa de Fé
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo, {casaFe?.nome_lider}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Hero Card */}
        <Card className="p-8 mb-8 shadow-glow border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{casaFe?.nome_lider}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {casaFe?.campus}
                    </p>
                  </div>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                <p className="font-semibold">{casaFe?.endereco}</p>
              </div>
              {casaFe?.rede && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Rede</p>
                  <p className="font-semibold">{casaFe?.rede}</p>
                </div>
              )}
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Horário</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {casaFe?.horario_reuniao}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{membrosCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total de Membros</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-success" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">
                  {casaFe?.dias_semana?.[0] || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Dia de Reunião</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{aceitouJesusCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Aceitaram Jesus</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-success" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{reconciliouCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Reconciliaram</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerta de Relatórios Pendentes */}
        {relatoriosPendentes > 0 && (
          <Card className="p-6 mb-8 shadow-medium border-destructive/20 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-destructive">
                    {relatoriosPendentes} Relatório{relatoriosPendentes > 1 ? 's' : ''} Pendente{relatoriosPendentes > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem relatórios da reunião que precisam ser preenchidos
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/relatorio")}
                className="gradient-primary hover:shadow-glow"
              >
                Preencher Agora
              </Button>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Button
            size="lg"
            onClick={() => navigate("/membros")}
            className="h-20 text-lg gradient-primary hover:shadow-glow transition-all hover:scale-[1.02]"
          >
            <Users className="w-6 h-6 mr-3" />
            Ver Membros
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/presenca")}
            className="h-20 text-lg hover:bg-accent/5 hover:border-accent transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Registrar Presença
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/relatorio")}
            className="h-20 text-lg hover:bg-secondary/5 hover:border-secondary transition-all hover:scale-[1.02]"
          >
            <FileText className="w-6 h-6 mr-3" />
            Enviar Relatório
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/relatorios")}
            className="h-20 text-lg hover:bg-primary/5 hover:border-primary transition-all hover:scale-[1.02]"
          >
            <FileText className="w-6 h-6 mr-3" />
            Ver Relatórios
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/perfil")}
            className="h-20 text-lg hover:bg-success/5 hover:border-success transition-all hover:scale-[1.02]"
          >
            <User className="w-6 h-6 mr-3" />
            Editar Perfil
          </Button>
        </div>

        {/* Gráfico de Presença */}
        <Card className="p-6 shadow-medium">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Frequência dos Membros
          </h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMembrosFrequenciaData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={120} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="presencas" fill="hsl(var(--primary))" name="Presenças" />
              <Bar dataKey="faltas" fill="hsl(var(--destructive))" name="Faltas" />
            </BarChart>
          </ResponsiveContainer>

          {/* Lista de Membros com Status */}
          <div className="mt-6 space-y-3">
            <h3 className="font-bold text-lg">Membros</h3>
            {getMembrosComStatus().map((membro) => (
              <div
                key={membro.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  membro.faltasRecentes > 0
                    ? "bg-destructive/5 border-destructive/20"
                    : "bg-success/5 border-success/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    membro.faltasRecentes > 0
                      ? "bg-destructive/20 text-destructive"
                      : "bg-success/20 text-success"
                  }`}>
                    {membro.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{membro.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      {membro.presencasTotal} presenças • {membro.faltasRecentes} faltas recentes
                    </p>
                  </div>
                </div>
                
                {membro.faltasRecentes > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const mensagem = encodeURIComponent(`Olá ${membro.nome_completo.split(' ')[0]}, notamos sua ausência na Casa de Fé. Está tudo bem? Como podemos ajudar? 🙏`);
                      window.open(`https://wa.me/55${membro.telefone.replace(/\D/g, '')}?text=${mensagem}`, '_blank');
                    }}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                )}
                {membro.faltasRecentes === 0 && (
                  <CheckCircle className="w-6 h-6 text-success" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
