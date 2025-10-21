import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CasaFe {
  id: string;
  user_id: string;
  nome_lider: string;
  campus: string;
  rede: string | null;
  endereco: string;
  telefone: string | null;
  email: string;
}

const SelecioneCasa = () => {
  const navigate = useNavigate();
  const [casas, setCasas] = useState<CasaFe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = sessionStorage.getItem("multi_casas_list");
        if (raw) {
          setCasas(JSON.parse(raw));
          return;
        }
        // Fallback: busca casas do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        const { data } = await supabase
          .from("casas_fe")
          .select("*")
          .eq("user_id", user.id);
        if (!data || data.length <= 1) {
          if (data && data.length === 1) {
            localStorage.setItem("user_id", data[0].user_id);
            localStorage.setItem("selected_casa_id", data[0].id);
          }
          navigate("/dashboard");
          return;
        }
        setCasas(data as CasaFe[]);
      } catch (e) {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSelectCasa = async (casa: CasaFe) => {
    try {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const { error } = await supabase.auth.signInWithPassword({
          email: casa.email,
          password: "123456",
        });
        if (error) {
          toast.error("Erro ao entrar. Verifique as credenciais.");
          setLoading(false);
          return;
        }
      }
      localStorage.setItem("user_id", casa.user_id);
      localStorage.setItem("selected_casa_id", casa.id);
      sessionStorage.removeItem("multi_casas_list");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Erro ao selecionar a Casa de Fé");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary animate-pulse shadow-glow" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle p-4">
      <header className="max-w-xl mx-auto flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/login")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Selecione uma Casa de Fé</h1>
          <p className="text-sm text-muted-foreground">Escolha com qual deseja acessar</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto space-y-3">
        {casas.map((casa) => (
          <Card
            key={casa.id}
            className="p-4 cursor-pointer hover:bg-accent/5 transition-all"
            onClick={() => handleSelectCasa(casa)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{casa.nome_lider}</p>
                <p className="text-sm text-muted-foreground">{casa.campus} {casa.rede ? `- ${casa.rede}` : ""}</p>
                <p className="text-xs text-muted-foreground">{casa.endereco}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {casa.telefone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {casa.telefone}</span>
                  )}
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {casa.email}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default SelecioneCasa;
