import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Home, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface CasaFe {
  id: string;
  nome_lider: string;
  campus: string;
  rede: string;
  endereco: string;
  telefone: string;
  email: string;
  nome_dupla?: string | null;
  telefone_dupla?: string | null;
}

const AdminCasas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casas, setCasas] = useState<CasaFe[]>([]);
  const [filteredCasas, setFilteredCasas] = useState<CasaFe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [campusFilter, setCampusFilter] = useState("todos");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterCasas();
  }, [searchTerm, campusFilter, casas]);

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

      await loadCasas();
    } catch (error) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const loadCasas = async () => {
    try {
      const { data, error } = await supabase
        .from("casas_fe")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCasas(data || []);
      setFilteredCasas(data || []);
    } catch (error: any) {
      console.error("Error loading casas:", error);
      toast.error("Erro ao carregar casas");
    } finally {
      setLoading(false);
    }
  };

  const filterCasas = () => {
    let filtered = [...casas];

    if (searchTerm) {
      filtered = filtered.filter(
        (casa) =>
          casa.nome_lider.toLowerCase().includes(searchTerm.toLowerCase()) ||
          casa.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (campusFilter !== "todos") {
      filtered = filtered.filter((casa) => casa.campus === campusFilter);
    }

    setFilteredCasas(filtered);
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
          <h1 className="text-2xl font-bold">Todas as Casas de Fé</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por líder ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Campus</SelectItem>
                <SelectItem value="MINC Pampulha">MINC Pampulha</SelectItem>
                <SelectItem value="MINC Lagoa Santa">MINC Lagoa Santa</SelectItem>
                <SelectItem value="MINC São José da Lapa">MINC São José da Lapa</SelectItem>
                <SelectItem value="MINC Ribeirão das Neves">MINC Ribeirão das Neves</SelectItem>
                <SelectItem value="MINC Rio">MINC Rio</SelectItem>
                <SelectItem value="MINC São Paulo">MINC São Paulo</SelectItem>
                <SelectItem value="MINC Juiz de Fora">MINC Juiz de Fora</SelectItem>
                <SelectItem value="MINC Online">MINC Online</SelectItem>
                <SelectItem value="MINC Sinop">MINC Sinop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid gap-4">
          {filteredCasas.map((casa) => (
            <Card
              key={casa.id}
              className="p-6 hover:shadow-medium transition-smooth"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/admin/casas/${casa.id}`)}
                >
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/admin/casas/${casa.id}`)}>
                  <h3 className="font-bold text-lg mb-1">{casa.nome_lider}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {casa.email} • {casa.telefone}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {casa.campus}
                    </span>
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                      {casa.rede}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{casa.endereco}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      const phone = casa.telefone.replace(/\D/g, '');
                      const message = encodeURIComponent(`Olá ${casa.nome_lider}, tudo bem? Sou da administração da MINC.`);
                      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Líder
                  </Button>
                  {casa.telefone_dupla && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        const phone = casa.telefone_dupla!.replace(/\D/g, '');
                        const message = encodeURIComponent(`Olá ${casa.nome_dupla || 'dupla'}, tudo bem? Sou da administração da MINC.`);
                        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Dupla
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredCasas.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nenhuma casa de fé encontrada</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCasas;
