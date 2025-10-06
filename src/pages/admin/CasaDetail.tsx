import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Users, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

interface CasaFe {
  id: string;
  nome_lider: string;
  campus: string;
  rede: string;
  endereco: string;
  telefone: string;
  email: string;
  horario_reuniao: string;
  dias_semana: string[];
  nome_dupla?: string | null;
  telefone_dupla?: string | null;
  email_dupla?: string | null;
}

interface Membro {
  id: string;
  nome_completo: string;
  telefone: string;
  idade: number;
  endereco: string;
  aceitou_jesus: boolean;
  notas: string | null;
}

const AdminCasaDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [casa, setCasa] = useState<CasaFe | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);

  useEffect(() => {
    checkAdminAndLoad();
  }, [id]);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: isAdminData, error } = await supabase.rpc("is_admin");
      
      if (error || !isAdminData) {
        toast.error("Acesso negado");
        navigate("/dashboard");
        return;
      }

      await loadCasaDetails();
    } catch (error) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const loadCasaDetails = async () => {
    try {
      const { data: casaData, error: casaError } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("id", id)
        .single();

      if (casaError) throw casaError;
      setCasa(casaData);

      const { data: membrosData, error: membrosError } = await supabase
        .from("membros")
        .select("*")
        .eq("casa_fe_id", id)
        .order("nome_completo");

      if (membrosError) throw membrosError;
      setMembros(membrosData || []);
    } catch (error: any) {
      console.error("Error loading details:", error);
      toast.error("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !casa) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/casas")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{casa.nome_lider}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Campus</p>
                  <p className="font-medium">{casa.campus}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Rede</p>
                  <p className="font-medium">{casa.rede}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{casa.endereco}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">{casa.horario_reuniao}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias das Reuniões</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {casa.dias_semana?.map((dia: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {dia.replace('-feira', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Dupla */}
          {(casa.nome_dupla || casa.telefone_dupla || casa.email_dupla) && (
            <div className="border-t mt-6 pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Dupla
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {casa.nome_dupla && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{casa.nome_dupla}</p>
                  </div>
                )}
                {casa.telefone_dupla && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{casa.telefone_dupla}</p>
                  </div>
                )}
                {casa.email_dupla && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{casa.email_dupla}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros ({membros.length})
          </h2>
          <div className="space-y-3">
            {membros.map((membro) => (
              <div key={membro.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{membro.nome_completo}</h3>
                  {membro.aceitou_jesus && (
                    <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
                      Convertido
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{membro.telefone} • {membro.idade} anos</p>
                  <p>{membro.endereco}</p>
                  {membro.notas && <p className="italic">"{membro.notas}"</p>}
                </div>
              </div>
            ))}
            {membros.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum membro cadastrado ainda
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminCasaDetail;
