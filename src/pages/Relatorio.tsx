import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, FileText, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Relatorio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [notas, setNotas] = useState("");
  const [datasDisponiveis, setDatasDisponiveis] = useState<string[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState("");

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

      const { data: casaData, error } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCasaFe(casaData);

      // Buscar todas as datas onde há presença registrada
      const { data: presencas } = await supabase
        .from("presencas")
        .select("data_reuniao")
        .in("membro_id", 
          await supabase
            .from("membros")
            .select("id")
            .eq("casa_fe_id", casaData.id)
            .then(({ data }) => data?.map(m => m.id) || [])
        )
        .order("data_reuniao", { ascending: false });

      if (presencas && presencas.length > 0) {
        // Pegar datas únicas de presença
        const datasUnicas = [...new Set(presencas.map(p => p.data_reuniao))];
        
        // Verificar quais datas já têm relatório
        const { data: relatorios } = await supabase
          .from("relatorios")
          .select("data_reuniao, notas")
          .eq("casa_fe_id", casaData.id);

        const datasComRelatorioPreenchido = relatorios
          ?.filter((r) => r.notas && r.notas.trim() !== "")
          .map((r) => r.data_reuniao) || [];
        
        // Datas com presença e SEM relatório preenchido
        const datasPendentes = datasUnicas.filter(
          (data) => !datasComRelatorioPreenchido.includes(data)
        );

        setDatasDisponiveis(datasPendentes);

        // Pré-selecionar data vinda da URL (se disponível)
        const params = new URLSearchParams(location.search);
        const dataParam = params.get("data");
        
        if (dataParam && datasPendentes.includes(dataParam)) {
          setDataSelecionada(dataParam);
        } else if (datasPendentes.length > 0) {
          setDataSelecionada(datasPendentes[0]);
        }
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

    if (!dataSelecionada) {
      toast.error("Selecione uma data de reunião");
      return;
    }

    if (!notas.trim()) {
      toast.error("Preencha o relatório da reunião");
      return;
    }

    if (!casaFe?.id) {
      toast.error("Casa de Fé não encontrada");
      return;
    }

    setSending(true);

    try {
      // Verificar se já existe relatório para esta data
      const { data: relatorioExistente } = await supabase
        .from("relatorios")
        .select("id, notas")
        .eq("casa_fe_id", casaFe.id)
        .eq("data_reuniao", dataSelecionada)
        .maybeSingle();

      if (relatorioExistente) {
        // Se existe e está vazio, atualizar
        if (!relatorioExistente.notas || relatorioExistente.notas.trim() === "") {
          const { error } = await supabase
            .from("relatorios")
            .update({ notas: notas.trim() })
            .eq("id", relatorioExistente.id);

          if (error) throw error;
        } else {
          // Se já tem notas, avisar o usuário
          toast.error("Já existe um relatório preenchido para esta data");
          setSending(false);
          return;
        }
      } else {
        // Não existe, criar novo
        const { error } = await supabase
          .from("relatorios")
          .insert({
            casa_fe_id: casaFe.id,
            data_reuniao: dataSelecionada,
            notas: notas.trim(),
          });

        if (error) throw error;
      }
      
      toast.success("Relatório enviado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting relatório:", error);
      toast.error(`Erro ao enviar relatório: ${error.message || "Tente novamente"}`);
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

  if (datasDisponiveis.length === 0) {
    return (
      <div className="min-h-screen gradient-subtle">
        <header className="bg-card shadow-soft sticky top-0 z-10 border-b">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Relatório da Reunião</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          <Card className="p-8 shadow-medium text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum Relatório Pendente</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa marcar presença em uma reunião antes de poder enviar um relatório.
            </p>
            <Button onClick={() => navigate("/presenca")} className="gradient-primary">
              <Calendar className="w-5 h-5 mr-2" />
              Marcar Presença
            </Button>
          </Card>
        </main>
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
              <Label htmlFor="data_reuniao" className="text-base flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Data da Reunião
              </Label>
              <select
                id="data_reuniao"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background"
                required
              >
                {datasDisponiveis.map((data) => (
                  <option key={data} value={data}>
                    {format(new Date(data + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Apenas datas com presença registrada e sem relatório estão disponíveis
              </p>
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
              disabled={sending}
            >
              <Send className="w-5 h-5 mr-2" />
              {sending ? "Enviando..." : "Enviar Relatório"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Relatorio;
