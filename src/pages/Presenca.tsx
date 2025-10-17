import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { format, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Presenca = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<any[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [aceitouJesus, setAceitouJesus] = useState<Record<string, boolean>>({});
  const [reconciliouJesus, setReconciliouJesus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [historico, setHistorico] = useState<Record<string, string[]>>({});
  const hoje = new Date();

  useEffect(() => {
    loadMembros();
  }, []);

  const loadMembros = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

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
        console.error("Error loading casa:", casaError);
        toast.error("Erro ao carregar Casa de Fé. Verifique se você tem uma casa cadastrada.");
        setLoading(false);
        return;
      }

      if (casaData) {
        setCasaFe(casaData);
        const { data: membrosData, error } = await supabase
          .from("membros")
          .select("*")
          .eq("casa_fe_id", casaData.id)
          .order("nome_completo");

        if (error) {
          console.error("Error loading membros:", error);
          throw error;
        }

        console.log("Membros carregados:", membrosData?.length || 0);
        setMembros(membrosData || []);

        const initialPresencas: Record<string, boolean> = {};
        const initialAceitou: Record<string, boolean> = {};
        const initialReconciliou: Record<string, boolean> = {};
        
        membrosData?.forEach((membro) => {
          initialPresencas[membro.id] = false;
          initialAceitou[membro.id] = membro.aceitou_jesus || false;
          initialReconciliou[membro.id] = membro.reconciliou_jesus || false;
        });
        
        setPresencas(initialPresencas);
        setAceitouJesus(initialAceitou);
        setReconciliouJesus(initialReconciliou);
      }
    } catch (error: any) {
      console.error("Error loading membros:", error);
      toast.error("Erro ao carregar membros: " + (error.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  // Recarrega presenças já salvas quando a data muda
  useEffect(() => {
    const carregar = async () => {
      if (membros.length === 0) return;
      try {
        const membroIds = membros.map(m => m.id);
        const { data: presencasDia } = await supabase
          .from("presencas")
          .select("membro_id")
          .in("membro_id", membroIds)
          .eq("data_reuniao", selectedDate)
          .eq("presente", true);

        const presMap: Record<string, boolean> = {};
        membros.forEach((m) => { presMap[m.id] = false; });
        presencasDia?.forEach((p: any) => { presMap[p.membro_id] = true; });
        setPresencas(presMap);
      } catch (e) {
        console.error("Erro ao carregar presenças da data:", e);
      }
    };
    carregar();
  }, [selectedDate, membros]);

  // Carregar histórico de presenças
  useEffect(() => {
    const carregarHistorico = async () => {
      if (!casaFe || membros.length === 0) return;
      try {
        const membroIds = membros.map((m) => m.id);
        const { data: presencasHist } = await supabase
          .from("presencas")
          .select("membro_id, data_reuniao")
          .in("membro_id", membroIds)
          .eq("presente", true)
          .order("data_reuniao", { ascending: false })
          .limit(200);

        const map: Record<string, string[]> = {};
        presencasHist?.forEach((p: any) => {
          const nome = membros.find((m) => m.id === p.membro_id)?.nome_completo || "Membro";
          if (!map[p.data_reuniao]) map[p.data_reuniao] = [];
          map[p.data_reuniao].push(nome);
        });
        setHistorico(map);
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    };
    carregarHistorico();
  }, [casaFe, membros]);

  const handleSavePresencas = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!selectedDate) {
        toast.error("Selecione a data da reunião.");
        setSaving(false);
        return;
      }

      // Salvar presenças - apenas membros marcados como presentes
      const presencasData = Object.entries(presencas)
        .filter(([_, presente]) => presente)
        .map(([membroId, presente]) => ({
          membro_id: membroId,
          data_reuniao: selectedDate,
          presente: true,
        }));

      if (presencasData.length === 0) {
        setSaving(false);
        toast.error("Marque pelo menos um membro como presente.");
        return;
      }

      const { error: presencasError } = await supabase.from("presencas").insert(presencasData);
      if (presencasError) {
        console.error("Erro ao salvar presenças:", presencasError);
        throw presencasError;
      }

      // Atualizar membros que aceitaram ou reconciliaram com Jesus
      const updatePromises = membros.map((membro) => {
        const needsUpdate = 
          aceitouJesus[membro.id] !== membro.aceitou_jesus ||
          reconciliouJesus[membro.id] !== membro.reconciliou_jesus;

        if (needsUpdate) {
          return supabase
            .from("membros")
            .update({
              aceitou_jesus: aceitouJesus[membro.id],
              reconciliou_jesus: reconciliouJesus[membro.id],
            })
            .eq("id", membro.id);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      toast.success("Presenças salvas! Agora preencha o relatório.");
      navigate(`/relatorio?data=${selectedDate}`);

    } catch (error: any) {
      console.error("Error saving presencas:", error);
      toast.error("Erro ao salvar presenças");
    } finally {
      setSaving(false);
    }
  };

  const presentesCount = Object.values(presencas).filter(p => p).length;

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
            <h1 className="text-2xl font-bold">Registrar Presença</h1>
            <p className="text-sm text-muted-foreground">
              {format(hoje, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className="p-5 mb-6 shadow-soft">
          <div>
            <label className="text-sm font-medium">Data da Reunião</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-md border border-input bg-background"
            />
          </div>
        </Card>

        <Card className="p-5 mb-6 shadow-soft gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total de membros</p>
              <p className="text-3xl font-bold">{membros.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Presentes hoje</p>
              <p className="text-3xl font-bold">{presentesCount}</p>
            </div>
          </div>
        </Card>

        {membros.length === 0 ? (
          <Card className="p-12 text-center shadow-soft">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg mb-2">
              Nenhum membro cadastrado ainda
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione membros à sua Casa de Fé antes de registrar presença.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/membros")}
            >
              Ir para Membros
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {membros.map((membro) => (
                <Card 
                  key={membro.id} 
                  className={`p-4 shadow-soft transition-all ${
                    presencas[membro.id] ? 'bg-success/5 border-success' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`presente-${membro.id}`}
                        checked={presencas[membro.id]}
                        onCheckedChange={(checked) =>
                          setPresencas({ ...presencas, [membro.id]: !!checked })
                        }
                        className="w-6 h-6"
                      />
                      <label htmlFor={`presente-${membro.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-base">{membro.nome_completo}</p>
                            <p className="text-sm text-muted-foreground">
                              {membro.idade} anos
                            </p>
                          </div>
                          {presencas[membro.id] && (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="pl-10 space-y-2 border-l-2 border-muted ml-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`aceitou-${membro.id}`}
                          checked={aceitouJesus[membro.id]}
                          onCheckedChange={(checked) =>
                            setAceitouJesus({ ...aceitouJesus, [membro.id]: !!checked })
                          }
                        />
                        <label 
                          htmlFor={`aceitou-${membro.id}`} 
                          className="text-sm cursor-pointer"
                        >
                          Aceitou Jesus
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`reconciliou-${membro.id}`}
                          checked={reconciliouJesus[membro.id]}
                          onCheckedChange={(checked) =>
                            setReconciliouJesus({ ...reconciliouJesus, [membro.id]: !!checked })
                          }
                        />
                        <label 
                          htmlFor={`reconciliou-${membro.id}`} 
                          className="text-sm cursor-pointer"
                        >
                          Reconciliou com Jesus
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {Object.keys(historico).length > 0 && (
              <Card className="p-5 mb-6 shadow-soft">
                <h3 className="font-semibold mb-3">Histórico de Presenças</h3>
                <div className="space-y-3">
                  {Object.entries(historico).slice(0, 6).map(([data, nomes]) => (
                    <div key={data} className="text-sm">
                      <div className="font-medium">
                        {format(new Date(data + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR })} • {nomes.length} presentes
                      </div>
                      <div className="text-muted-foreground">{nomes.join(", ")}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Button
              size="lg"
              className="w-full h-14 text-base gradient-primary hover:shadow-glow transition-smooth"
              onClick={handleSavePresencas}
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Salvando..." : "Salvar Presenças"}
            </Button>
          </>
        )}
      </main>
    </div>
  );
};

export default Presenca;