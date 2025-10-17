import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, FileText, Calendar, Home, Filter, Download, 
  BarChart3, TrendingUp, Users, Clock, MapPin, Network,
  FileDown, X, Search, ChevronDown, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))', 
  'hsl(var(--secondary))',
  'hsl(var(--success))',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981'
];

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [casasFe, setCasasFe] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [presencas, setPresencas] = useState<any[]>([]);
  
  // Filtros
  const [casaSelecionada, setCasaSelecionada] = useState<string>("todas");
  const [campusSelecionado, setCampusSelecionado] = useState<string>("todos");
  const [redeSelecionada, setRedeSelecionada] = useState<string>("todas");
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelatorios, setSelectedRelatorios] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRelatorios, setExpandedRelatorios] = useState<string[]>([]);
  
  // Filtros aplicados (separados dos temporários)
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    casa: "todas",
    campus: "todos",
    rede: "todas",
    inicio: "",
    fim: "",
    busca: ""
  });

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    await supabase.rpc("ensure_admin_role");
    const { data: isAdminData, error } = await supabase.rpc("is_admin");
    
    if (error || !isAdminData) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/login");
    }
  };

  const loadData = async () => {
    try {
      // Buscar todas as casas de fé
      const { data: casasData } = await supabase
        .from("casas_fe")
        .select("*")
        .order("nome_lider");
      setCasasFe(casasData || []);

      // Buscar todos os membros
      const { data: membrosData } = await supabase
        .from("membros")
        .select("*");
      setMembros(membrosData || []);

      // Buscar todas as presenças
      const { data: presencasData } = await supabase
        .from("presencas")
        .select("*");
      setPresencas(presencasData || []);

      // Buscar todos os relatórios
      const { data: relatoriosData } = await supabase
        .from("relatorios")
        .select(`
          *,
          casas_fe (
            nome_lider,
            campus,
            rede,
            endereco,
            horario_reuniao,
            dias_semana
          )
        `)
        .order("data_reuniao", { ascending: false });
      setRelatorios(relatoriosData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados({
      casa: casaSelecionada,
      campus: campusSelecionado,
      rede: redeSelecionada,
      inicio: periodoInicio,
      fim: periodoFim,
      busca: searchTerm
    });
    toast.success("Filtros aplicados!");
  };

  // Filtros aplicados aos relatórios
  const relatoriosFiltrados = relatorios.filter(r => {
    if (filtrosAplicados.casa !== "todas" && r.casa_fe_id !== filtrosAplicados.casa) return false;
    if (filtrosAplicados.campus !== "todos" && r.casas_fe?.campus !== filtrosAplicados.campus) return false;
    if (filtrosAplicados.rede !== "todas" && r.casas_fe?.rede !== filtrosAplicados.rede) return false;
    if (filtrosAplicados.inicio && r.data_reuniao < filtrosAplicados.inicio) return false;
    if (filtrosAplicados.fim && r.data_reuniao > filtrosAplicados.fim) return false;
    if (filtrosAplicados.busca && !r.casas_fe?.nome_lider.toLowerCase().includes(filtrosAplicados.busca.toLowerCase())) return false;
    return true;
  });

  // Casas filtradas para KPIs
  const casasFiltradas = casasFe.filter(c => {
    if (filtrosAplicados.casa !== "todas" && c.id !== filtrosAplicados.casa) return false;
    if (filtrosAplicados.campus !== "todos" && c.campus !== filtrosAplicados.campus) return false;
    if (filtrosAplicados.rede !== "todas" && c.rede !== filtrosAplicados.rede) return false;
    if (filtrosAplicados.busca && !c.nome_lider.toLowerCase().includes(filtrosAplicados.busca.toLowerCase())) return false;
    return true;
  });

  // IDs das casas filtradas
  const casasFiltradas_ids = casasFiltradas.map(c => c.id);

  // Membros filtrados
  const membrosFiltrados = membros.filter(m => casasFiltradas_ids.includes(m.casa_fe_id));

  // Presenças filtradas
  const presencasFiltradas = presencas.filter(p => {
    const membro = membros.find(m => m.id === p.membro_id);
    return membro && casasFiltradas_ids.includes(membro.casa_fe_id);
  });

  // Dados para gráficos
  const getRelatoriosPorCampus = () => {
    const campusCount: Record<string, number> = {};
    relatoriosFiltrados.forEach(r => {
      const campus = r.casas_fe?.campus || "Sem Campus";
      campusCount[campus] = (campusCount[campus] || 0) + 1;
    });
    return Object.entries(campusCount).map(([campus, count]) => ({
      campus,
      total: count
    })).sort((a, b) => b.total - a.total);
  };

  const getEvolucaoRelatorios = () => {
    // Se não houver relatórios, retornar array vazio
    if (relatoriosFiltrados.length === 0) {
      return [];
    }

    // Agrupar por data
    const porData: Record<string, number> = {};
    
    relatoriosFiltrados.forEach(r => {
      const data = format(parseISO(r.data_reuniao), "dd/MM");
      porData[data] = (porData[data] || 0) + 1;
    });
    
    return Object.entries(porData)
      .map(([data, total]) => ({
        semana: data,
        total
      }))
      .sort((a, b) => {
        // Converter dd/MM para Date para ordenar corretamente
        const [diaA, mesA] = a.semana.split('/').map(Number);
        const [diaB, mesB] = b.semana.split('/').map(Number);
        const dataA = new Date(2025, mesA - 1, diaA);
        const dataB = new Date(2025, mesB - 1, diaB);
        return dataA.getTime() - dataB.getTime();
      });
  };

  const getFrequenciaPorCasa = () => {
    return casasFiltradas.slice(0, 10).map(casa => {
      const casaMembros = membrosFiltrados.filter(m => m.casa_fe_id === casa.id);
      const casaPresencas = presencasFiltradas.filter(p => 
        casaMembros.some(m => m.id === p.membro_id) && p.presente
      );
      const total = presencasFiltradas.filter(p => casaMembros.some(m => m.id === p.membro_id)).length;
      const percentual = total > 0 ? Math.round((casaPresencas.length / total) * 100) : 0;
      
      return {
        nome: casa.nome_lider.split(' ')[0],
        frequencia: percentual,
        presencas: casaPresencas.length,
        total: total
      };
    }).sort((a, b) => b.frequencia - a.frequencia);
  };

  const getDistribuicaoRedes = () => {
    const redesCount: Record<string, number> = {};
    casasFiltradas.forEach(casa => {
      // Filtrar casas sem rede
      if (casa.rede && casa.rede.trim() !== "") {
        redesCount[casa.rede] = (redesCount[casa.rede] || 0) + 1;
      }
    });
    return Object.entries(redesCount).map(([name, value]) => ({ name, value }));
  };

  const getHorariosReuniao = () => {
    const horarios: Record<string, number> = {};
    casasFiltradas.forEach(casa => {
      if (casa.horario_reuniao) {
        const hora = casa.horario_reuniao.substring(0, 5);
        horarios[hora] = (horarios[hora] || 0) + 1;
      }
    });
    return Object.entries(horarios)
      .map(([horario, total]) => ({ horario, total }))
      .sort((a, b) => a.horario.localeCompare(b.horario));
  };

  const getDiasSemana = () => {
    // Ordem canônica dos dias
    const diasOrdem = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    // Mapeia variações para o formato canônico
    const map: Record<string, string> = {
      'seg': 'Segunda', 'segunda': 'Segunda', 'segunda-feira': 'Segunda',
      'ter': 'Terça', 'terca': 'Terça', 'terça': 'Terça', 'terca-feira': 'Terça', 'terça-feira': 'Terça',
      'qua': 'Quarta', 'quarta': 'Quarta', 'quarta-feira': 'Quarta',
      'qui': 'Quinta', 'quinta': 'Quinta', 'quinta-feira': 'Quinta',
      'sex': 'Sexta', 'sexta': 'Sexta', 'sexta-feira': 'Sexta',
      'sab': 'Sábado', 'sabado': 'Sábado', 'sábado': 'Sábado',
      'dom': 'Domingo', 'domingo': 'Domingo'
    };

    const removerAcentos = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const canon = (raw: string) => {
      const base = removerAcentos(raw.trim().toLowerCase())
        .replace(/-feira$/, '') // remove sufixo "-feira"
        .replace(/[^a-z]/g, ''); // remove símbolos
      return map[base] || map[base.slice(0, 3)] || null;
    };

    const contagem: Record<string, number> = {};
    diasOrdem.forEach((d) => (contagem[d] = 0));

    casasFiltradas.forEach((casa) => {
      if (casa.dias_semana && casa.dias_semana.length > 0) {
        casa.dias_semana.forEach((dia: string) => {
          const c = canon(dia);
          if (c) {
            contagem[c] = (contagem[c] || 0) + 1;
          }
        });
      }
    });

    // Retorna sempre na ordem canônica
    return diasOrdem.map((dia) => ({ dia, total: contagem[dia] }));
  };

  const getConversoesPorCampus = () => {
    return Array.from(new Set(casasFiltradas.map(c => c.campus))).map(campus => {
      const casasDoCampus = casasFiltradas.filter(c => c.campus === campus);
      const casaIds = casasDoCampus.map(c => c.id);
      const membrosDoCampus = membrosFiltrados.filter(m => casaIds.includes(m.casa_fe_id));
      
      return {
        campus,
        aceitaram: membrosDoCampus.filter(m => m.aceitou_jesus).length,
        reconciliaram: membrosDoCampus.filter(m => m.reconciliou_jesus).length,
        total: membrosDoCampus.length
      };
    });
  };

  // Exportações
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Analytics - Casas de Fé", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 30);
    doc.text(`Total de Casas: ${casasFiltradas.length}`, 14, 37);
    
    const tableData = casasFiltradas.map(c => [
      c.nome_lider || '',
      c.campus || '',
      c.rede || '',
      c.endereco?.substring(0, 30) + '...' || '',
      c.horario_reuniao || '',
      c.dias_semana?.join(', ') || ''
    ]);
    
    (doc as any).autoTable({
      head: [['Líder', 'Campus', 'Rede', 'Endereço', 'Horário', 'Dias']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [196, 161, 74] },
      columnStyles: {
        3: { cellWidth: 40 }
      }
    });
    
    doc.save(`analytics-casas-fe-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportarExcel = () => {
    const dados = relatoriosFiltrados.map(r => ({
      'Líder': r.casas_fe?.nome_lider,
      'Campus': r.casas_fe?.campus,
      'Rede': r.casas_fe?.rede,
      'Endereço': r.casas_fe?.endereco,
      'Horário': r.casas_fe?.horario_reuniao,
      'Dias': r.casas_fe?.dias_semana?.join(', '),
      'Data Reunião': format(parseISO(r.data_reuniao), "dd/MM/yyyy"),
      'Notas': r.notas,
      'Criado em': format(new Date(r.created_at), "dd/MM/yyyy HH:mm")
    }));
    
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatórios");
    XLSX.writeFile(wb, `relatorios-casas-fe-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  };

  const exportarSelecionados = () => {
    if (selectedRelatorios.length === 0) {
      toast.error("Selecione pelo menos um relatório");
      return;
    }
    
    const relatoriosSelecionados = relatorios.filter(r => selectedRelatorios.includes(r.id));
    const dados = relatoriosSelecionados.map(r => ({
      'Líder': r.casas_fe?.nome_lider,
      'Campus': r.casas_fe?.campus,
      'Data Reunião': format(parseISO(r.data_reuniao), "dd/MM/yyyy"),
      'Notas': r.notas
    }));
    
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selecionados");
    XLSX.writeFile(wb, `relatorios-selecionados-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success(`${selectedRelatorios.length} relatórios exportados!`);
  };

  const limparFiltros = () => {
    setCasaSelecionada("todas");
    setCampusSelecionado("todos");
    setRedeSelecionada("todas");
    setPeriodoInicio("");
    setPeriodoFim("");
    setSearchTerm("");
    setFiltrosAplicados({
      casa: "todas",
      campus: "todos",
      rede: "todas",
      inicio: "",
      fim: "",
      busca: ""
    });
    toast.success("Filtros limpos!");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-3 shadow-glow border-primary/20">
          <p className="font-bold text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </Card>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary animate-pulse shadow-glow" />
          <p className="text-lg font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const campusUnicos = Array.from(new Set(casasFe.map(c => c.campus)));
  const redesUnicas = Array.from(new Set(casasFe.map(c => c.rede).filter(Boolean)));

  return (
    <div className="min-h-screen gradient-subtle pb-20">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm shadow-soft sticky top-0 z-20 border-b">
        <div className="max-w-[1600px] mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Analytics & Relatórios
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Análise completa das Casas de Fé
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportarExcel} className="gap-2">
                <Download className="w-4 h-4" />
                Excel
              </Button>
              {selectedRelatorios.length > 0 && (
                <Button onClick={exportarSelecionados} className="gap-2 gradient-primary">
                  <Download className="w-4 h-4" />
                  Exportar {selectedRelatorios.length}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Filtros Avançados */}
        <Card className="p-6 shadow-medium mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Filtros Avançados</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Buscar Líder</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome do líder..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Campus</label>
                  <Select value={campusSelecionado} onValueChange={setCampusSelecionado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Campus</SelectItem>
                      {campusUnicos.map(campus => (
                        <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rede</label>
                  <Select value={redeSelecionada} onValueChange={setRedeSelecionada}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Redes</SelectItem>
                      {redesUnicas.map(rede => (
                        <SelectItem key={rede} value={rede}>{rede}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Casa de Fé</label>
                  <Select value={casaSelecionada} onValueChange={setCasaSelecionada}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Casas</SelectItem>
                      {casasFe.map(casa => (
                        <SelectItem key={casa.id} value={casa.id}>
                          {casa.nome_lider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Período Início</label>
                  <Input
                    type="date"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Período Fim</label>
                  <Input
                    type="date"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{relatoriosFiltrados.length}</span> relatórios encontrados
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={limparFiltros} className="gap-2">
                    <X className="w-4 h-4" />
                    Limpar
                  </Button>
                  <Button onClick={aplicarFiltros} className="gap-2 gradient-primary">
                    <Filter className="w-4 h-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Métricas Principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6 shadow-medium hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{casasFiltradas.length}</p>
            <p className="text-sm text-muted-foreground">Casas de Fé (Filtradas)</p>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{relatoriosFiltrados.length}</p>
            <p className="text-sm text-muted-foreground">Relatórios (Filtrados)</p>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{membrosFiltrados.length}</p>
            <p className="text-sm text-muted-foreground">Membros (Filtrados)</p>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {membrosFiltrados.filter(m => m.aceitou_jesus).length}
            </p>
            <p className="text-sm text-muted-foreground">Aceitaram Jesus (Filtrados)</p>
          </Card>
        </div>

        {/* TABS: Gráficos e Relatórios */}
        <Tabs defaultValue="graficos" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="graficos" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-2">
              <FileText className="w-4 h-4" />
              Relatórios Detalhados
            </TabsTrigger>
          </TabsList>

          {/* ABA GRÁFICOS */}
          <TabsContent value="graficos">
            {/* GRÁFICOS - Grid de 2 colunas */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Gráfico 1: Relatórios por Campus */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Relatórios por Campus
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRelatoriosPorCampus()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="campus" angle={-45} textAnchor="end" height={100} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Relatórios" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico 2: Evolução de Relatórios */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Evolução de Relatórios por Data
            </h2>
            {getEvolucaoRelatorios().length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-2 opacity-30" />
                  <p>Nenhum relatório encontrado</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getEvolucaoRelatorios()}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="semana" angle={-45} textAnchor="end" height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    name="Relatórios"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Gráfico 3: Frequência por Casa */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-success" />
              Top 10 Casas - Frequência
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getFrequenciaPorCasa()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="nome" type="category" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="frequencia" fill="hsl(var(--success))" name="Frequência %" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico 4: Distribuição de Redes */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-secondary" />
              Distribuição por Rede
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDistribuicaoRedes()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getDistribuicaoRedes().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico 5: Horários de Reunião */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Horários de Reunião
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getHorariosReuniao()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="horario" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Casas de Fé"
                  dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico 6: Dias da Semana */}
          <Card className="p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Dias da Semana
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDiasSemana()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dia" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="hsl(var(--accent))" name="Casas de Fé" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gráfico Grande: Conversões por Campus */}
        <Card className="p-6 shadow-medium mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Conversões por Campus
          </h2>
          <ResponsiveContainer width="100%" height={600}>
            <BarChart data={getConversoesPorCampus()} margin={{ bottom: 120, left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="campus" 
                angle={-45} 
                textAnchor="end" 
                height={150}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={50}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              <Bar dataKey="aceitaram" fill="hsl(var(--primary))" name="Aceitaram Jesus" radius={[8, 8, 0, 0]} />
              <Bar dataKey="reconciliaram" fill="hsl(var(--success))" name="Reconciliaram" radius={[8, 8, 0, 0]} />
              <Bar dataKey="total" fill="hsl(var(--accent))" name="Total de Membros" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
          </TabsContent>

          {/* ABA RELATÓRIOS DETALHADOS */}
          <TabsContent value="relatorios">
        {/* Lista de Relatórios */}
        <Card className="p-6 shadow-medium">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Relatórios Detalhados
            <span className="text-sm font-normal text-muted-foreground">
              ({relatoriosFiltrados.length})
            </span>
          </h2>

          {relatoriosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhum relatório encontrado
              </p>
              <Button variant="outline" onClick={limparFiltros} className="mt-4">
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {relatoriosFiltrados.map((relatorio) => {
                const isExpanded = expandedRelatorios.includes(relatorio.id);
                const toggleExpand = () => {
                  if (isExpanded) {
                    setExpandedRelatorios(expandedRelatorios.filter(id => id !== relatorio.id));
                  } else {
                    setExpandedRelatorios([...expandedRelatorios, relatorio.id]);
                  }
                };

                return (
                  <div
                    key={relatorio.id}
                    className="flex items-start gap-4 p-5 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-primary/20"
                  >
                    <Checkbox
                      checked={selectedRelatorios.includes(relatorio.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRelatorios([...selectedRelatorios, relatorio.id]);
                        } else {
                          setSelectedRelatorios(selectedRelatorios.filter(id => id !== relatorio.id));
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            {relatorio.casas_fe?.nome_lider}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {relatorio.casas_fe?.campus} • {relatorio.casas_fe?.rede}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm font-medium bg-primary/10 px-3 py-1 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(relatorio.data_reuniao), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </div>
                      
                      {relatorio.notas && (
                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                          <button
                            onClick={toggleExpand}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm font-medium">Notas do Relatório</span>
                            <ChevronRight 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </button>
                          <div className={`px-3 pb-3 ${isExpanded ? 'block' : 'hidden'}`}>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {relatorio.notas}
                            </p>
                          </div>
                          {!isExpanded && (
                            <div className="px-3 pb-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {relatorio.notas}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminRelatorios;
