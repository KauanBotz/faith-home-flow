import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Presenca = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<any[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      const { data: casaData } = await supabase
        .from("casas_fe")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (casaData) {
        const { data: membrosData, error } = await supabase
          .from("membros")
          .select("*")
          .eq("casa_fe_id", casaData.id)
          .order("nome_completo");

        if (error) throw error;
        setMembros(membrosData || []);

        const initialPresencas: Record<string, boolean> = {};
        membrosData?.forEach((membro) => {
          initialPresencas[membro.id] = false;
        });
        setPresencas(initialPresencas);
      }
    } catch (error: any) {
      console.error("Error loading membros:", error);
      toast.error("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePresencas = async () => {
    setSaving(true);
    try {
      const presencasData = Object.entries(presencas).map(([membroId, presente]) => ({
        membro_id: membroId,
        data_reuniao: format(hoje, "yyyy-MM-dd"),
        presente,
      }));

      const { error } = await supabase.from("presencas").insert(presencasData);

      if (error) throw error;

      toast.success("Presença registrada com sucesso!");
      navigate("/dashboard");
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
            <p className="text-muted-foreground text-lg">
              Nenhum membro cadastrado ainda
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/membros")}
            >
              Adicionar Membros
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
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={membro.id}
                      checked={presencas[membro.id]}
                      onCheckedChange={(checked) =>
                        setPresencas({ ...presencas, [membro.id]: !!checked })
                      }
                      className="w-6 h-6"
                    />
                    <label htmlFor={membro.id} className="flex-1 cursor-pointer">
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
                </Card>
              ))}
            </div>

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
