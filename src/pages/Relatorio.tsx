import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Relatorio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [notas, setNotas] = useState("");
  const [dataReuniao, setDataReuniao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [relatorioExistente, setRelatorioExistente] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [dataReuniao]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: casaData, error } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCasaFe(casaData);

      // Limpar relatório existente quando mudar de data
      setRelatorioExistente(null);
      setNotas("");

      // Verificar se já existe relatório para a data selecionada
      const { data: relatorioData } = await supabase
        .from("relatorios")
        .select("*")
        .eq("casa_fe_id", casaData.id)
        .eq("data_reuniao", dataReuniao)
        .maybeSingle();

      if (relatorioData) {
        setRelatorioExistente(relatorioData);
        toast.info("Já existe um relatório para esta data. Escolha outra data.");
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (relatorioExistente) {
      toast.error("Já existe um relatório para esta data. Não é possível editar relatórios.");
      return;
    }

    setSending(true);

    try {
      // Criar novo relatório
      const { error } = await supabase
        .from("relatorios")
        .insert({
          casa_fe_id: casaFe.id,
          data_reuniao: dataReuniao,
          notas,
        });

      if (error) throw error;
      toast.success("Relatório enviado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting relatório:", error);
      toast.error("Erro ao enviar relatório");
    } finally {
      setSending(false);
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
            <h1 className="text-2xl font-bold">Relatório da Reunião</h1>
            <p className="text-sm text-muted-foreground">
              {casaFe?.nome_lider} - {casaFe?.campus}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Enviar Relatório</h2>
              <p className="text-sm text-muted-foreground">
                Registre as informações da reunião
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="data_reuniao" className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data da Reunião
              </Label>
              <input
                type="date"
                id="data_reuniao"
                value={dataReuniao}
                onChange={(e) => setDataReuniao(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-md border border-input bg-background"
                required
              />
            </div>

            <div>
              <Label htmlFor="notas" className="text-base">
                Notas / Relatório da Reunião
              </Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Descreva como foi a reunião, principais acontecimentos, decisões, conversões, etc..."
                className="mt-2 min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Informações importantes: presença, conversões, reconciliações, decisões de vida, etc.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 gradient-primary hover:shadow-glow transition-smooth mt-6"
              disabled={sending || relatorioExistente}
            >
              <Send className="w-5 h-5 mr-2" />
              {relatorioExistente ? "Relatório já existe" : sending ? "Enviando..." : "Enviar Relatório"}
            </Button>
            
            {relatorioExistente && (
              <p className="text-sm text-destructive text-center mt-2">
                Já existe um relatório para esta data. Escolha outra data para criar um novo relatório.
              </p>
            )}
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Relatorio;