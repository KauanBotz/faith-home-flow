import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, MessageCircle, FileDown, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";

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
  rede: string;
}

const AdminMembros = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [casas, setCasas] = useState<Record<string, CasaFe>>({});
  const [filteredMembros, setFilteredMembros] = useState<Membro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [convertidoFilter, setConvertidoFilter] = useState("todos");
  const [campusFilter, setCampusFilter] = useState("todos");
  const [redeFilter, setRedeFilter] = useState("todas");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterMembros();
  }, [searchTerm, convertidoFilter, campusFilter, redeFilter, membros]);

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
        .select("id, nome_lider, campus, rede");

      if (casasError) throw casasError;

      const casasMap: Record<string, CasaFe> = {};
      casasData?.forEach((casa) => {
        casasMap[casa.id] = casa;
      });

      setMembros(membrosData || []);
      setCasas(casasMap);
      setFilteredMembros(membrosData || []);
    } catch (error: any) {
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

    if (campusFilter !== "todos") {
      filtered = filtered.filter((membro) => {
        const casa = casas[membro.casa_fe_id];
        return casa && casa.campus === campusFilter;
      });
    }

    if (campusFilter === "MINC Pampulha" && redeFilter !== "todas") {
      filtered = filtered.filter((membro) => {
        const casa = casas[membro.casa_fe_id];
        return casa && casa.rede === redeFilter;
      });
    }

    setFilteredMembros(filtered);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Membros - Relatório Completo", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 14, 30);
    doc.text(`Total: ${filteredMembros.length} membros`, 14, 37);
    
    const tableData = filteredMembros.map(m => {
      const casa = casas[m.casa_fe_id];
      return [
        m.nome_completo,
        casa?.nome_lider || '-',
        casa?.campus || '-',
        m.telefone,
        m.aceitou_jesus ? 'Sim' : 'Não'
      ];
    });
    
    (doc as any).autoTable({
      head: [['Nome', 'Casa de Fé', 'Campus', 'Telefone', 'Convertido']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [196, 161, 74] }
    });
    
    doc.save(`membros-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportarExcel = () => {
    const dados = filteredMembros.map(m => {
      const casa = casas[m.casa_fe_id];
      return {
        'Nome': m.nome_completo,
        'Casa de Fé': casa?.nome_lider || '-',
        'Campus': casa?.campus || '-',
        'Rede': casa?.rede || '-',
        'Telefone': m.telefone,
        'Idade': m.idade,
        'Endereço': m.endereco,
        'Convertido': m.aceitou_jesus ? 'Sim' : 'Não',
        'Notas': m.notas || '-'
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Membros");
    XLSX.writeFile(wb, `membros-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel exportado com sucesso!");
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
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportarExcel}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Todos os Membros ({filteredMembros.length})</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={campusFilter} onValueChange={setCampusFilter}>
              <SelectTrigger>
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
                {campusFilter === "MINC Pampulha" && (
                  <Select value={redeFilter} onValueChange={setRedeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar rede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Redes</SelectItem>
                      <SelectItem value="Gerar">Gerar</SelectItem>
                      <SelectItem value="Gerações">Gerações</SelectItem>
                      <SelectItem value="Ative">Ative</SelectItem>
                      <SelectItem value="Avance">Avance</SelectItem>
                      <SelectItem value="Nexo">Nexo</SelectItem>
                      <SelectItem value="Plug">Plug</SelectItem>
                    </SelectContent>
                  </Select>
                )}
            <Select value={convertidoFilter} onValueChange={setConvertidoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar conversão" />
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const phone = membro.telefone.replace(/\D/g, '');
                      const message = encodeURIComponent(`Olá ${membro.nome_completo}, tudo bem? Sou da administração da MINC.`);
                      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Mensagem
                  </Button>
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
