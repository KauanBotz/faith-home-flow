import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const Membros = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error: any) {
      console.error("Error loading membros:", error);
      toast.error("Erro ao carregar membros");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Membros</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="hero" size="lg" className="w-full">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        <div className="space-y-4">
          {membros.map((membro) => (
            <Card key={membro.id} className="p-4 shadow-medium">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{membro.nome_completo}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{membro.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{membro.endereco}</span>
                    </div>
                    <p>Idade: {membro.idade} anos</p>
                  </div>
                  {membro.aceitou_jesus && (
                    <div className="mt-2 inline-block bg-success/10 text-success px-3 py-1 rounded-full text-xs font-medium">
                      ✅ Aceitou Jesus
                    </div>
                  )}
                  {membro.notas && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      {membro.notas}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {membros.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum membro cadastrado ainda</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Membros;
