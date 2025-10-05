import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

        // Initialize presencas
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

      toast.success("Presenças registradas com sucesso! ✅");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving presencas:", error);
      toast.error("Erro ao salvar presenças");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Registrar Presença</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6 shadow-medium">
          <p className="text-center text-lg">
            <strong>Data:</strong> {format(hoje, "dd/MM/yyyy")}
          </p>
        </Card>

        <div className="space-y-3 mb-6">
          {membros.map((membro) => (
            <Card key={membro.id} className="p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <Checkbox
                  id={membro.id}
                  checked={presencas[membro.id]}
                  onCheckedChange={(checked) =>
                    setPresencas({ ...presencas, [membro.id]: !!checked })
                  }
                />
                <label htmlFor={membro.id} className="flex-1 cursor-pointer">
                  <p className="font-medium">{membro.nome_completo}</p>
                  <p className="text-sm text-muted-foreground">
                    {membro.idade} anos
                  </p>
                </label>
              </div>
            </Card>
          ))}
        </div>

        {membros.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum membro cadastrado</p>
          </div>
        )}

        {membros.length > 0 && (
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSavePresencas}
            disabled={saving}
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Salvando..." : "Salvar Presenças"}
          </Button>
        )}
      </main>
    </div>
  );
};

export default Presenca;
