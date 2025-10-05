import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const RelatoriosLeitura = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [relatorios, setRelatorios] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: casaData, error: casaError } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (casaError) throw casaError;
      setCasaFe(casaData);

      // Buscar todos os relatórios da casa de fé
      const { data: relatoriosData, error: relatoriosError } = await supabase
        .from("relatorios")
        .select("*")
        .eq("casa_fe_id", casaData.id)
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Histórico de Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              {casaFe?.nome_lider} - {casaFe?.campus}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {relatorios.length === 0 ? (
          <Card className="p-8 text-center shadow-medium">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum Relatório</h2>
            <p className="text-muted-foreground mb-6">
              Você ainda não enviou nenhum relatório de reunião.
            </p>
            <Button onClick={() => navigate("/relatorio")} className="gradient-primary">
              Enviar Primeiro Relatório
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Total de Relatórios</h2>
                <p className="text-sm text-muted-foreground">{relatorios.length} relatórios enviados</p>
              </div>
            </div>

            {relatorios.map((relatorio) => (
              <Card key={relatorio.id} className="p-6 shadow-medium hover:shadow-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(relatorio.data_reuniao + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h3>
                        <p className="text-xs text-muted-foreground">
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

export default RelatoriosLeitura;
