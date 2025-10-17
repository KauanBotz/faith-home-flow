import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, LogOut, User, MapPin, Clock, Sparkles, TrendingUp, FileText, Heart, UserCheck, MessageCircle, CheckCircle, BookOpen, Download, Plus, BookMarked, Pen, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddMembroDialog } from "@/components/admin/AddMembroDialog";
import { TestemunhoDialog } from "@/components/dashboard/TestemunhoDialog";
import { OracaoDialog } from "@/components/dashboard/OracaoDialog";
import ReactMarkdown from "react-markdown";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [showAddMembro, setShowAddMembro] = useState(false);
  const [showTestemunho, setShowTestemunho] = useState(false);
  const [showOracao, setShowOracao] = useState(false);
  const [palavraPastor, setPalavraPastor] = useState<any>(null);
  const [testemunhos, setTestemunhos] = useState<any[]>([]);
  const [oracoes, setOracoes] = useState<any[]>([]);
  const [showHistoricoTestemunhos, setShowHistoricoTestemunhos] = useState(false);
  const [showHistoricoOracoes, setShowHistoricoOracoes] = useState(false);
  const [showHistoricoPalavra, setShowHistoricoPalavra] = useState(false);
  const [palavrasAnteriores, setPalavrasAnteriores] = useState<any[]>([]);
  const [palavraSelecionada, setPalavraSelecionada] = useState(null);

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

    // Verificar se há casa selecionada no localStorage
    const selectedCasaId = localStorage.getItem("selected_casa_id");

    let casaQuery = supabase
      .from("casas_fe")
      .select("*")
      .eq("user_id", user.id);

    if (selectedCasaId) {
      casaQuery = casaQuery.eq("id", selectedCasaId);
    }

    const { data: casaData, error: casaError } = await casaQuery.single();

    if (casaError) {
      console.error("Erro ao carregar casa:", casaError);
      toast.error("Erro ao carregar Casa de Fé");
      return;
    }

    setCasaFe(casaData);

    if (casaData) {
      // Buscar membros
      const { data: membrosData, count } = await supabase
        .from("membros")
        .select("*", { count: "exact" })
        .eq("casa_fe_id", casaData.id);
      
      setMembrosCount(count || 0);
      setMembrosData(membrosData || []);

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

        // Calcular relatórios pendentes de forma simplificada
        try {
          // Buscar datas únicas de presença
          const { data: presencas } = await supabase
            .from("presencas")
            .select("data_reuniao")
            .in("membro_id", membroIds)
            .eq("presente", true)
            .order("data_reuniao", { ascending: false });

          if (presencas && presencas.length > 0) {
            const datasPresenca = [...new Set(presencas.map(p => p.data_reuniao))];
            
            // Buscar relatórios existentes
            const { data: relatorios } = await supabase
              .from("relatorios")
              .select("data_reuniao, notas")
              .eq("casa_fe_id", casaData.id);

            // Filtrar apenas relatórios que têm conteúdo
            const datasComRelatorioPreenchido = (relatorios || [])
              .filter(r => r.notas && r.notas.trim() !== "")
              .map(r => r.data_reuniao);
            
            // Contar pendentes
            const pendentes = datasPresenca.filter(
              data => !datasComRelatorioPreenchido.includes(data)
            ).length;
            
            setRelatoriosPendentes(pendentes);
          } else {
            setRelatoriosPendentes(0);
          }
        } catch (relError) {
          console.error("Erro ao calcular relatórios pendentes:", relError);
          setRelatoriosPendentes(0);
        }
      } else {
        setRelatoriosPendentes(0);
      }

      // Carregar palavra do pastor
      const { data: palavraData } = await supabase
        .from("palavra_pastor")
        .select("*")
        .order("data_publicacao", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setPalavraPastor(palavraData);

      // Carregar palavras anteriores
      const { data: palavrasAnterioresData } = await supabase
        .from("palavra_pastor")
        .select("*")
        .order("data_publicacao", { ascending: false })
        .limit(10);
      
      setPalavrasAnteriores(palavrasAnterioresData || []);

      // Carregar testemunhos
      const { data: testemunhosData } = await supabase
        .from("testemunhos")
        .select("*")
        .eq("casa_fe_id", casaData.id)
        .order("data_testemunho", { ascending: false })
        .limit(10);
      
      setTestemunhos(testemunhosData || []);

      // Carregar orações
      const { data: oracoesData } = await supabase
        .from("oracoes")
        .select("*")
        .eq("casa_fe_id", casaData.id)
        .order("data_oracao", { ascending: false })
        .limit(10);
      
      setOracoes(oracoesData || []);
    }
  } catch (error: any) {
    console.error("Error loading dashboard:", error);
    toast.error("Erro ao carregar dados do dashboard");
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo! Graça e Paz.");
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
           <div className="flex items-center gap-3">
              <img src="../favicon.png" alt="" className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Minha Casa de Fé
              </h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo, {casaFe?.nome_lider}
              </p>
            </div>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
          <Button
            size="lg"
            onClick={() => setShowAddMembro(true)}
            className="h-20 gradient-primary hover:shadow-glow transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <Plus className="w-7 h-7" />
            <span className="text-sm font-semibold">Adicionar Membro</span>
          </Button>

          <Button
            size="lg"
            onClick={() => navigate("/membros")}
            className="h-20 gradient-primary hover:shadow-glow transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <Users className="w-7 h-7" />
            <span className="text-sm font-semibold">Ver Membros</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/presenca")}
            className="h-20 hover:bg-accent/5 hover:border-accent transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <Calendar className="w-7 h-7" />
            <span className="text-sm font-semibold">Acompanhar Membros</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/relatorio")}
            className="h-20 hover:bg-secondary/5 hover:border-secondary transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <FileText className="w-7 h-7" />
            <span className="text-sm font-semibold">Enviar Relatório</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/relatorios")}
            className="h-20 hover:bg-primary/5 hover:border-primary transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <FileText className="w-7 h-7" />
            <span className="text-sm font-semibold">Histórico de Relatórios</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/perfil")}
            className="h-20 hover:bg-success/5 hover:border-success transition-all hover:scale-[1.02] flex-col gap-1"
          >
            <User className="w-7 h-7" />
            <span className="text-sm font-semibold">Minha Casa de Fé</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-20 hover:bg-accent/5 hover:border-accent transition-all hover:scale-[1.02] flex-col gap-1 px-3"
          >
            <a href="/instrucoes-casa-de-fe.pdf" download="Instrucoes_Casa_de_Fe.pdf" className="flex flex-col items-center justify-center gap-1">
              <BookOpen className="w-6 h-6" />
              <span className="text-xs font-semibold text-center leading-tight">Instruções<br />Casa de Fé</span>
            </a>
          </Button>
        </div>

          {/* Seções: Palavra do Pastor, Testemunho e Oração */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Palavra do Pastor */}
            <Card className="p-6 shadow-medium hover:shadow-lg transition-all">
              <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Palavra do Pastor
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Acompanhe semanalmente a palavra da <br></br>jornada da Casa de Fé.
                </p>
              </div>
              
              {palavraPastor ? (
                <div>
                  <div 
                    className="cursor-pointer hover:bg-muted/30 p-4 rounded-lg transition-all border border-transparent hover:border-primary/20"
                    onClick={() => setPalavraSelecionada(palavraPastor)}
                  >
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(parseISO(palavraPastor.data_publicacao), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <h4 className="font-bold text-base mb-2">{palavraPastor.titulo}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {palavraPastor.conteudo}
                    </p>
                  </div>

                  {palavrasAnteriores.length > 1 && (
                    <Collapsible open={showHistoricoPalavra} onOpenChange={setShowHistoricoPalavra} className="mt-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full">
                          <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showHistoricoPalavra ? 'rotate-180' : ''}`} />
                          Anteriores ({palavrasAnteriores.length - 1})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {palavrasAnteriores.slice(1).map((palavra) => (
                          <div 
                            key={palavra.id} 
                            className="p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-all"
                            onClick={() => setPalavraSelecionada(palavra)}
                          >
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(parseISO(palavra.data_publicacao), "dd/MM/yyyy")}
                            </p>
                            <p className="font-semibold text-sm">{palavra.titulo}</p>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma palavra ainda</p>
              )}
            </Card>

            {/* Testemunhos */}
            <Card className="p-6 shadow-medium hover:shadow-lg transition-all">
              <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Testemunhos
                  </h3>
                  <Button size="sm" onClick={() => setShowTestemunho(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Acompanhe os testemunhos que estão <br></br>acontecendo durante a Casa de Fé.
                </p>
              </div>

              {testemunhos.length > 0 ? (
                <div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(parseISO(testemunhos[0].data_testemunho), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="font-bold text-sm mb-2">{testemunhos[0].nome_pessoa}</p>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {testemunhos[0].testemunho}
                    </p>
                  </div>

                  {testemunhos.length > 1 && (
                    <Collapsible open={showHistoricoTestemunhos} onOpenChange={setShowHistoricoTestemunhos} className="mt-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full">
                          <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showHistoricoTestemunhos ? 'rotate-180' : ''}`} />
                          Anteriores ({testemunhos.length - 1})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {testemunhos.slice(1).map((test) => (
                          <div key={test.id} className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(parseISO(test.data_testemunho), "dd/MM/yyyy")} • {test.nome_pessoa}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {test.testemunho}
                            </p>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum testemunho ainda</p>
              )}
            </Card>

            {/* Orações */}
            <Card className="p-6 shadow-medium hover:shadow-lg transition-all">
              <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Pedidos de Oração
                  </h3>
                  <Button size="sm" onClick={() => setShowOracao(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Veja pedidos de todos os facilitadores da MINC <br></br> e membros das Casas de Fé.
                </p>
              </div>

              {oracoes.length > 0 ? (
                <div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(parseISO(oracoes[0].data_oracao), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {oracoes[0].pedido}
                    </p>
                  </div>

                  {oracoes.length > 1 && (
                    <Collapsible open={showHistoricoOracoes} onOpenChange={setShowHistoricoOracoes} className="mt-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full">
                          <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showHistoricoOracoes ? 'rotate-180' : ''}`} />
                          Anteriores ({oracoes.length - 1})
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-2">
                        {oracoes.slice(1).map((oracao) => (
                          <div key={oracao.id} className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(parseISO(oracao.data_oracao), "dd/MM/yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {oracao.pedido}
                            </p>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum pedido ainda</p>
              )}
            </Card>
          </div>

          {/* Dialog palavra */}
          <Dialog open={!!palavraSelecionada} onOpenChange={(open) => !open && setPalavraSelecionada(null)}>
            <DialogContent 
              className="max-w-3xl max-h-[85vh] overflow-y-auto"
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl">{palavraSelecionada?.titulo}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {palavraSelecionada && format(parseISO(palavraSelecionada.data_publicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </DialogHeader>
              <div className="prose prose-lg max-w-none mt-4">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  }}
                >
                  {palavraSelecionada?.conteudo}
                </ReactMarkdown>
              </div>
              <Button 
                onClick={() => setPalavraSelecionada(null)} 
                className="mt-4"
                variant="outline"
              >
                Fechar
              </Button>
            </DialogContent>
          </Dialog>

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

      <AddMembroDialog
        open={showAddMembro}
        onOpenChange={setShowAddMembro}
        casaFeId={casaFe?.id || ""}
        onSuccess={loadDashboardData}
      />

      <TestemunhoDialog
        open={showTestemunho}
        onOpenChange={setShowTestemunho}
        casaFeId={casaFe?.id || ""}
        onSaved={loadDashboardData}
      />

      <OracaoDialog
        open={showOracao}
        onOpenChange={setShowOracao}
        casaFeId={casaFe?.id || ""}
        onSaved={loadDashboardData}
      />
    </div>
  );
};

export default Dashboard;
