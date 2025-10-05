import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const RelatoriosLeitura = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [semanaInicio, setSemanaInicio] = useState(format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd"));
  const [semanaFim, setSemanaFim] = useState(format(endOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd"));

  useEffect(() => {
    loadData();
  }, [semanaInicio, semanaFim]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: casaData } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!casaData) {
        toast.error("Casa de Fé não encontrada");
        navigate("/dashboard");
        return;
      }

      setCasaFe(casaData);

      const { data: relatoriosData, error } = await supabase
        .from("relatorios")
        .select("*")
        .eq("casa_fe_id", casaData.id)
        .gte("data_reuniao", semanaInicio)
        .lte("data_reuniao", semanaFim)
        .order("data_reuniao", { ascending: false });

      if (error) throw error;
      setRelatorios(relatoriosData || []);
    } catch (error: any) {
      console.error("Error loading relatórios:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const handleSemanaAnterior = () => {
    const inicio = parseISO(semanaInicio);
    const novoInicio = new Date(inicio);
    novoInicio.setDate(inicio.getDate() - 7);
    const novoFim = new Date(novoInicio);
    novoFim.setDate(novoInicio.getDate() + 6);
    
    setSemanaInicio(format(novoInicio, "yyyy-MM-dd"));
    setSemanaFim(format(novoFim, "yyyy-MM-dd"));
  };

  const handleProximaSemana = () => {
    const inicio = parseISO(semanaInicio);
    const novoInicio = new Date(inicio);
    novoInicio.setDate(inicio.getDate() + 7);
    const novoFim = new Date(novoInicio);
    novoFim.setDate(novoInicio.getDate() + 6);
    
    setSemanaInicio(format(novoInicio, "yyyy-MM-dd"));
    setSemanaFim(format(novoFim, "yyyy-MM-dd"));
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
      <header className="bg-card shadow-soft sticky top-0 z-10 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Relatórios por Semana
            </h1>
            <p className="text-sm text-muted-foreground">
              {casaFe?.nome_lider} - {casaFe?.campus}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Filtro de Semana */}
        <Card className="p-6 mb-6 shadow-medium">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Selecione a Semana</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSemanaAnterior}>
              ← Semana Anterior
            </Button>
            
            <div className="flex-1 flex items-center justify-center gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">De</Label>
                <p className="font-semibold">
                  {format(parseISO(semanaInicio), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <span className="text-muted-foreground">até</span>
              <div>
                <Label className="text-sm text-muted-foreground">Até</Label>
                <p className="font-semibold">
                  {format(parseISO(semanaFim), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={handleProximaSemana}>
              Próxima Semana →
            </Button>
          </div>
        </Card>

        {/* Lista de Relatórios */}
        <div className="space-y-4">
          {relatorios.length === 0 ? (
            <Card className="p-12 text-center shadow-medium">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-bold mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground">
                Não há relatórios para esta semana
              </p>
            </Card>
          ) : (
            relatorios.map((relatorio) => (
              <Card key={relatorio.id} className="p-6 shadow-medium hover:shadow-glow transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {format(parseISO(relatorio.data_reuniao), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enviado em {format(parseISO(relatorio.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate("/relatorio");
                    }}
                  >
                    Editar
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <Label className="text-sm font-semibold mb-2 block">Notas da Reunião</Label>
                  {relatorio.notas ? (
                    <p className="text-sm whitespace-pre-wrap">{relatorio.notas}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma nota foi adicionada a este relatório
                    </p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default RelatoriosLeitura;
