import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const Perfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [casaFe, setCasaFe] = useState<any>(null);

  useEffect(() => {
    loadCasaFe();
  }, []);

  const loadCasaFe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCasaFe(data);
    } catch (error: any) {
      console.error("Error loading casa fe:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("casas_fe")
        .update({
          nome_lider: casaFe.nome_lider,
          endereco: casaFe.endereco,
          telefone: casaFe.telefone,
        })
        .eq("id", casaFe.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso! ✨");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error updating perfil:", error);
      toast.error("Erro ao atualizar perfil");
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
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 shadow-elegant">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="nome_lider">Nome do Líder</Label>
              <Input
                id="nome_lider"
                value={casaFe?.nome_lider || ""}
                onChange={(e) => setCasaFe({ ...casaFe, nome_lider: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={casaFe?.endereco || ""}
                onChange={(e) => setCasaFe({ ...casaFe, endereco: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={casaFe?.telefone || ""}
                onChange={(e) => setCasaFe({ ...casaFe, telefone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Campus</Label>
              <Input value={casaFe?.campus || ""} disabled />
            </div>

            <div>
              <Label>Rede</Label>
              <Input value={casaFe?.rede || ""} disabled />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={saving}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Perfil;
