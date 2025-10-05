import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users } from "lucide-react";
import { toast } from "sonner";

interface Membro {
  id: string;
  nome_completo: string;
  telefone: string;
  idade: number;
  endereco: string;
  aceitou_jesus: boolean;
  notas: string | null;
  casa_fe_id: string;
}

interface CasaFe {
  id: string;
  nome_lider: string;
  campus: string;
}

const AdminMembros = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [casas, setCasas] = useState<Record<string, CasaFe>>({});
  const [filteredMembros, setFilteredMembros] = useState<Membro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [convertidoFilter, setConvertidoFilter] = useState("todos");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterMembros();
  }, [searchTerm, convertidoFilter, membros]);

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

      await loadMembros();
    } catch (error) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const loadMembros = async () => {
    try {
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros")
        .select("*")
        .order("nome_completo");

      if (membrosError) throw membrosError;

      const { data: casasData, error: casasError } = await supabase
        .from("casas_fe")
        .select("id, nome_lider, campus");

      if (casasError) throw casasError;

      const casasMap: Record<string, CasaFe> = {};
      casasData?.forEach((casa) => {
        casasMap[casa.id] = casa;
      });

      setMembros(membrosData || []);
      setCasas(casasMap);
      setFilteredMembros(membrosData || []);
    } catch (error: any) {
      console.error("Error loading membros:", error);
      toast.error("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  const filterMembros = () => {
    let filtered = [...membros];

    if (searchTerm) {
      filtered = filtered.filter((membro) =>
        membro.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (convertidoFilter === "sim") {
      filtered = filtered.filter((membro) => membro.aceitou_jesus);
    } else if (convertidoFilter === "nao") {
      filtered = filtered.filter((membro) => !membro.aceitou_jesus);
    }

    setFilteredMembros(filtered);
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Todos os Membros</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={convertidoFilter} onValueChange={setConvertidoFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por conversão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Convertidos</SelectItem>
                <SelectItem value="nao">Não Convertidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid gap-4">
          {filteredMembros.map((membro) => {
            const casa = casas[membro.casa_fe_id];
            return (
              <Card key={membro.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{membro.nome_completo}</h3>
                      {membro.aceitou_jesus && (
                        <span className="bg-success/10 text-success px-2 py-1 rounded-full text-xs">
                          Convertido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {membro.telefone} • {membro.idade} anos
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">{membro.endereco}</p>
                    {casa && (
                      <p className="text-sm">
                        <span className="font-medium">Casa de Fé:</span> {casa.nome_lider} ({casa.campus})
                      </p>
                    )}
                    {membro.notas && (
                      <p className="text-sm text-muted-foreground italic mt-2">"{membro.notas}"</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredMembros.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum membro encontrado</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMembros;
