import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, User } from "lucide-react";
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

      toast.success("Perfil atualizado com sucesso!");
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
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">Edite suas informações</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{casaFe?.nome_lider}</h2>
              <p className="text-sm text-muted-foreground">{casaFe?.campus}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label htmlFor="nome_lider" className="text-base">Nome do Líder</Label>
              <Input
                id="nome_lider"
                value={casaFe?.nome_lider || ""}
                onChange={(e) => setCasaFe({ ...casaFe, nome_lider: e.target.value })}
                className="mt-2 h-11"
                required
              />
            </div>

            <div>
              <Label htmlFor="endereco" className="text-base">Endereço</Label>
              <Input
                id="endereco"
                value={casaFe?.endereco || ""}
                onChange={(e) => setCasaFe({ ...casaFe, endereco: e.target.value })}
                className="mt-2 h-11"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone" className="text-base">Telefone</Label>
              <Input
                id="telefone"
                value={casaFe?.telefone || ""}
                onChange={(e) => setCasaFe({ ...casaFe, telefone: e.target.value })}
                className="mt-2 h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base">Campus</Label>
                <Input 
                  value={casaFe?.campus || ""} 
                  disabled 
                  className="mt-2 h-11 bg-muted"
                />
              </div>

              <div>
                <Label className="text-base">Rede</Label>
                <Input 
                  value={casaFe?.rede || ""} 
                  disabled 
                  className="mt-2 h-11 bg-muted"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 gradient-primary hover:shadow-glow transition-smooth mt-6"
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
