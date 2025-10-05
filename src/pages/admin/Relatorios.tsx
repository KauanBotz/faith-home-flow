import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar, Home, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [casasFe, setCasasFe] = useState<any[]>([]);
  const [casaSelecionada, setCasaSelecionada] = useState<string>("todas");

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

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roles || roles.role !== "admin") {
      navigate("/dashboard");
      toast.error("Acesso negado");
    }
  };

  const loadData = async () => {
    try {
      // Buscar todas as casas de fé
      const { data: casasData, error: casasError } = await supabase
        .from("casas_fe")
        .select("*")
        .order("nome_lider");

      if (casasError) throw casasError;
      setCasasFe(casasData || []);

      // Buscar todos os relatórios com informações da casa de fé
      const { data: relatoriosData, error: relatoriosError } = await supabase
        .from("relatorios")
        .select(`
          *,
          casas_fe (
            nome_lider,
            campus,
            rede,
            endereco
          )
        `)
        .order("data_reuniao", { ascending: false });

      if (relatoriosError) throw relatoriosError;
      setRelatorios(relatoriosData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const relatoriosFiltrados = casaSelecionada === "todas"
    ? relatorios
    : relatorios.filter(r => r.casa_fe_id === casaSelecionada);

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
      <header className="bg-card shadow-soft sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Relatórios das Casas de Fé</h1>
                <p className="text-sm text-muted-foreground">
                  Visualize todos os relatórios enviados
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <Card className="p-6 shadow-medium mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Select value={casaSelecionada} onValueChange={setCasaSelecionada}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Filtrar por Casa de Fé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Casas de Fé</SelectItem>
                  {casasFe.map((casa) => (
                    <SelectItem key={casa.id} value={casa.id}>
                      {casa.nome_lider} - {casa.campus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {relatoriosFiltrados.length} relatórios
            </div>
          </div>
        </Card>

        {relatoriosFiltrados.length === 0 ? (
          <Card className="p-8 text-center shadow-medium">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum Relatório</h2>
            <p className="text-muted-foreground">
              {casaSelecionada === "todas" 
                ? "Ainda não há relatórios enviados."
                : "Esta casa de fé ainda não enviou nenhum relatório."
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {relatoriosFiltrados.map((relatorio) => (
              <Card key={relatorio.id} className="p-6 shadow-medium hover:shadow-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Home className="w-4 h-4 text-primary" />
                          <h3 className="text-lg font-bold">
                            {relatorio.casas_fe?.nome_lider}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {relatorio.casas_fe?.campus} • {relatorio.casas_fe?.rede}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(relatorio.data_reuniao + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enviado em {format(new Date(relatorio.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-4 mt-3">
                      <p className="text-sm font-medium mb-2">Notas da Reunião:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{relatorio.notas}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminRelatorios;
