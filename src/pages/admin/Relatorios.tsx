import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, FileSpreadsheet, FileText, Calendar as CalendarIcon, TrendingUp, Users, Home, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ['#FF6B35', '#F4A261', '#2A9D8F', '#264653', '#FF8066'];

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casas, setCasas] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  const [presencas, setPresencas] = useState<any[]>([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    campus: "todos",
    rede: "todas",
    dataInicio: "",
    dataFim: "",
    diaSemana: "todos",
  });

  // Dados calculados
  const [stats, setStats] = useState({
    totalCasas: 0,
    totalMembros: 0,
    taxaPresenca: 0,
    totalConversoes: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      calcularStats();
    }
  }, [casas, membros, presencas, filtros]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      await supabase.rpc("ensure_admin_role");
      const { data: isAdminData, error } = await supabase.rpc("is_admin");
      
      if (error || !isAdminData) {
        toast.error("Acesso negado");
        navigate("/login");
        return;
      }

      await loadData();
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  };

  const loadData = async () => {
    try {
      const [casasRes, membrosRes, presencasRes] = await Promise.all([
        supabase.from("casas_fe").select("*"),
        supabase.from("membros").select("*"),
        supabase.from("presencas").select("*"),
      ]);

      setCasas(casasRes.data || []);
      setMembros(membrosRes.data || []);
      setPresencas(presencasRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const calcularStats = () => {
    let casasFiltradas = casas;
    let membrosFiltrados = membros;

    // Aplicar filtros
    if (filtros.campus !== "todos") {
      casasFiltradas = casasFiltradas.filter(c => c.campus === filtros.campus);
    }
    if (filtros.rede !== "todas") {
      casasFiltradas = casasFiltradas.filter(c => c.rede === filtros.rede);
    }
    if (filtros.diaSemana !== "todos") {
      casasFiltradas = casasFiltradas.filter(c => 
        c.dias_semana?.includes(filtros.diaSemana)
      );
    }

    const casaIds = casasFiltradas.map(c => c.id);
    membrosFiltrados = membrosFiltrados.filter(m => casaIds.includes(m.casa_fe_id));

    const membroIds = membrosFiltrados.map(m => m.id);
    let presencasFiltradas = presencas.filter(p => membroIds.includes(p.membro_id));

    if (filtros.dataInicio) {
      presencasFiltradas = presencasFiltradas.filter(p => 
        new Date(p.data_reuniao) >= new Date(filtros.dataInicio)
      );
    }
    if (filtros.dataFim) {
      presencasFiltradas = presencasFiltradas.filter(p => 
        new Date(p.data_reuniao) <= new Date(filtros.dataFim)
      );
    }

    const totalPresencas = presencasFiltradas.filter(p => p.presente).length;
    const taxaPresenca = presencasFiltradas.length > 0 
      ? (totalPresencas / presencasFiltradas.length) * 100 
      : 0;

    const totalConversoes = membrosFiltrados.filter(m => m.aceitou_jesus).length;

    setStats({
      totalCasas: casasFiltradas.length,
      totalMembros: membrosFiltrados.length,
      taxaPresenca: Math.round(taxaPresenca),
      totalConversoes,
    });
  };

  const getDadosPorCampus = () => {
    const campusData: Record<string, number> = {};
    casas.forEach(casa => {
      if (filtros.campus === "todos" || casa.campus === filtros.campus) {
        campusData[casa.campus] = (campusData[casa.campus] || 0) + 1;
      }
    });
    return Object.entries(campusData).map(([name, value]) => ({ name, value }));
  };

  const getDadosPorRede = () => {
    const redeData: Record<string, number> = {};
    casas.forEach(casa => {
      if (filtros.rede === "todas" || casa.rede === filtros.rede) {
        const casaMembros = membros.filter(m => m.casa_fe_id === casa.id);
        redeData[casa.rede] = (redeData[casa.rede] || 0) + casaMembros.length;
      }
    });
    return Object.entries(redeData).map(([name, value]) => ({ name, value }));
  };

  const getDadosFrequencia = () => {
    const frequenciaData: Record<string, { presentes: number, total: number }> = {};
    
    presencas.forEach(p => {
      const data = new Date(p.data_reuniao).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      if (!frequenciaData[data]) {
        frequenciaData[data] = { presentes: 0, total: 0 };
      }
      frequenciaData[data].total++;
      if (p.presente) frequenciaData[data].presentes++;
    });

    return Object.entries(frequenciaData)
      .map(([data, counts]) => ({
        data,
        taxa: Math.round((counts.presentes / counts.total) * 100),
        presentes: counts.presentes,
        total: counts.total,
      }))
      .slice(-10);
  };

  const getDadosConversoes = () => {
    const conversaoData: Record<string, number> = {};
    
    membros.forEach(m => {
      if (m.aceitou_jesus) {
        const mes = new Date(m.created_at).toLocaleDateString('pt-BR', { month: 'short' });
        conversaoData[mes] = (conversaoData[mes] || 0) + 1;
      }
    });

    return Object.entries(conversaoData).map(([mes, total]) => ({ mes, total }));
  };

  const getDadosPorHorario = () => {
    const horarioData: Record<string, number> = {};
    
    casas.forEach(casa => {
      if (casa.horario_reuniao) {
        const hora = casa.horario_reuniao.substring(0, 2);
        horarioData[`${hora}h`] = (horarioData[`${hora}h`] || 0) + 1;
      }
    });

    return Object.entries(horarioData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([horario, quantidade]) => ({ horario, quantidade }));
  };

  const getDadosPorDiaSemana = () => {
    const diaData: Record<string, number> = {};
    const diasOrdem = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    
    casas.forEach(casa => {
      if (casa.dias_semana && Array.isArray(casa.dias_semana)) {
        casa.dias_semana.forEach((dia: string) => {
          diaData[dia] = (diaData[dia] || 0) + 1;
        });
      }
    });

    return diasOrdem
      .filter(dia => diaData[dia])
      .map(dia => ({ 
        dia: dia.substring(0, 3), 
        quantidade: diaData[dia] 
      }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Relatório Completo - Casas de Fé", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
    
    // Estatísticas
    doc.setFontSize(16);
    doc.text("Estatísticas Gerais", 14, 45);
    doc.setFontSize(12);
    doc.text(`Total de Casas: ${stats.totalCasas}`, 14, 55);
    doc.text(`Total de Membros: ${stats.totalMembros}`, 14, 62);
    doc.text(`Taxa de Presença: ${stats.taxaPresenca}%`, 14, 69);
    doc.text(`Total de Conversões: ${stats.totalConversoes}`, 14, 76);

    // Tabela de casas
    const casasTableData = casas.map(c => [
      c.nome_lider,
      c.campus,
      c.rede,
      membros.filter(m => m.casa_fe_id === c.id).length,
    ]);

    autoTable(doc, {
      startY: 90,
      head: [["Líder", "Campus", "Rede", "Membros"]],
      body: casasTableData,
    });

    doc.save("relatorio-casas-de-fe.pdf");
    toast.success("PDF gerado com sucesso!");
  };

  const handleExportExcel = () => {
    // Simples CSV para Excel
    const csvData = [
      ["Líder", "Campus", "Rede", "Endereço", "Membros", "Taxa Presença"],
      ...casas.map(c => {
        const casaMembros = membros.filter(m => m.casa_fe_id === c.id);
        const casaPresencas = presencas.filter(p => 
          casaMembros.some(m => m.id === p.membro_id)
        );
        const taxa = casaPresencas.length > 0
          ? Math.round((casaPresencas.filter(p => p.presente).length / casaPresencas.length) * 100)
          : 0;
        
        return [
          c.nome_lider,
          c.campus,
          c.rede,
          c.endereco,
          casaMembros.length,
          `${taxa}%`,
        ];
      }),
    ];

    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-casas-de-fe.csv";
    a.click();
    toast.success("Excel gerado com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-pulse" />
          <p className="text-lg font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle pb-20">
      <header className="bg-card shadow-soft sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Relatórios & Analytics</h1>
              <p className="text-sm text-muted-foreground">Dashboard completo com gráficos e exportações</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros Avançados */}
        <Card className="p-6 mb-6 shadow-medium">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Filtros Avançados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label>Campus</Label>
              <Select value={filtros.campus} onValueChange={(v) => setFiltros({...filtros, campus: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="MINC Lagoa Santa">MINC Lagoa Santa</SelectItem>
                  <SelectItem value="MINC São José da Lapa">MINC São José da Lapa</SelectItem>
                  <SelectItem value="MINC Ribeirão das Neves">MINC Ribeirão das Neves</SelectItem>
                  <SelectItem value="MINC Rio">MINC Rio</SelectItem>
                  <SelectItem value="MINC São Paulo">MINC São Paulo</SelectItem>
                  <SelectItem value="MINC Juiz de Fora">MINC Juiz de Fora</SelectItem>
                  <SelectItem value="MINC Online">MINC Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rede</Label>
              <Select value={filtros.rede} onValueChange={(v) => setFiltros({...filtros, rede: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Gerar (MINC Pampulha)">Gerar (MINC Pampulha)</SelectItem>
                  <SelectItem value="Ative (MINC Pampulha)">Ative (MINC Pampulha)</SelectItem>
                  <SelectItem value="Avance (MINC Pampulha)">Avance (MINC Pampulha)</SelectItem>
                  <SelectItem value="Nexo (MINC Pampulha)">Nexo (MINC Pampulha)</SelectItem>
                  <SelectItem value="Plug (MINC Pampulha)">Plug (MINC Pampulha)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Dia da Semana</Label>
              <Select value={filtros.diaSemana} onValueChange={(v) => setFiltros({...filtros, diaSemana: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Segunda-feira">Segunda</SelectItem>
                  <SelectItem value="Terça-feira">Terça</SelectItem>
                  <SelectItem value="Quarta-feira">Quarta</SelectItem>
                  <SelectItem value="Quinta-feira">Quinta</SelectItem>
                  <SelectItem value="Sexta-feira">Sexta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Início</Label>
              <Input 
                type="date" 
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              />
            </div>

            <div>
              <Label>Data Fim</Label>
              <Input 
                type="date" 
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <Home className="w-8 h-8 text-primary" />
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold">{stats.totalCasas}</p>
            <p className="text-sm text-muted-foreground">Total de Casas</p>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-accent" />
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold">{stats.totalMembros}</p>
            <p className="text-sm text-muted-foreground">Total de Membros</p>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <span className="text-xs font-semibold text-success">{stats.taxaPresenca}%</span>
            </div>
            <p className="text-3xl font-bold">{stats.taxaPresenca}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Presença</p>
          </Card>

          <Card className="p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold">{stats.totalConversoes}</p>
            <p className="text-sm text-muted-foreground">Conversões</p>
          </Card>
        </div>

        {/* Gráficos - Linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Casas por Campus
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDadosPorCampus()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#FF6B35" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Membros por Rede
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDadosPorRede()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getDadosPorRede().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gráficos - Linha 2 */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Taxa de Frequência ao Longo do Tempo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDadosFrequencia()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="taxa" stroke="#2A9D8F" strokeWidth={3} name="Taxa %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gráficos - Linha 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Conversões por Mês
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getDadosConversoes()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Casas por Horário
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDadosPorHorario()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="horario" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#F4A261" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gráfico - Dia da Semana */}
        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-success" />
            Distribuição por Dia da Semana
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getDadosPorDiaSemana()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#2A9D8F" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
};

export default AdminRelatorios;
