import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Phone, MapPin, Edit, Download, User, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Membros = () => {
  const navigate = useNavigate();
  const [membros, setMembros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMembro, setEditingMembro] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      toast.error("Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMembro = async () => {
    try {
      const { error } = await supabase
        .from("membros")
        .update({
          nome_completo: editingMembro.nome_completo,
          telefone: editingMembro.telefone,
          idade: editingMembro.idade,
          endereco: editingMembro.endereco,
          aceitou_jesus: editingMembro.aceitou_jesus,
          reconciliou_jesus: editingMembro.reconciliou_jesus,
          notas: editingMembro.notas,
        })
        .eq("id", editingMembro.id);

      if (error) throw error;

      toast.success("Membro atualizado com sucesso!");
      setIsDialogOpen(false);
      loadMembros();
    } catch (error: any) {
      toast.error("Erro ao atualizar membro");
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Lista de Membros - Casa de Fé", 14, 20);
    
    const tableData = membros.map(m => [
      m.nome_completo,
      m.telefone,
      m.idade,
      m.endereco,
      m.aceitou_jesus ? "Sim" : "Não",
      m.reconciliou_jesus ? "Sim" : "Não",
      m.notas || "-"
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Nome", "Telefone", "Idade", "Endereço", "Aceitou Jesus", "Reconciliou", "Notas"]],
      body: tableData,
    });

    doc.save("membros-casa-de-fe.pdf");
    toast.success("PDF baixado com sucesso!");
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
            <h1 className="text-2xl font-bold">Meus Membros</h1>
            <p className="text-sm text-muted-foreground">{membros.length} pessoas</p>
          </div>
          {membros.length > 0 && (
            <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
              <Download className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            size="lg" 
            className="w-full h-14 gradient-primary hover:shadow-glow transition-smooth"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Novo Membro
          </Button>
        </div>

        {membros.length === 0 ? (
          <Card className="p-12 text-center shadow-soft">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              Nenhum membro cadastrado ainda
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {membros.map((membro) => (
              <Card key={membro.id} className="p-5 shadow-soft hover:shadow-medium transition-smooth">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-3">{membro.nome_completo}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{membro.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{membro.endereco}</span>
                      </div>
                      <p className="font-medium">{membro.idade} anos</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {membro.aceitou_jesus && (
                        <div className="inline-block bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold">
                          Aceitou Jesus
                        </div>
                      )}
                      {membro.reconciliou_jesus && (
                        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          Reconciliou
                        </div>
                      )}
                    </div>
                    {membro.notas && (
                      <p className="mt-3 text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">
                        {membro.notas}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const mensagem = encodeURIComponent(`Olá ${membro.nome_completo.split(' ')[0]}! Tudo bem? 😊`);
                        window.open(`https://wa.me/55${membro.telefone.replace(/\D/g, '')}?text=${mensagem}`, '_blank');
                      }}
                      className="shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    
                    <Dialog open={isDialogOpen && editingMembro?.id === membro.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setEditingMembro(membro)}
                        className="shrink-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar Membro</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Nome Completo</Label>
                          <Input
                            value={editingMembro?.nome_completo || ""}
                            onChange={(e) => setEditingMembro({...editingMembro, nome_completo: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input
                            value={editingMembro?.telefone || ""}
                            onChange={(e) => setEditingMembro({...editingMembro, telefone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Idade</Label>
                          <Input
                            type="number"
                            value={editingMembro?.idade || ""}
                            onChange={(e) => setEditingMembro({...editingMembro, idade: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Endereço</Label>
                          <Input
                            value={editingMembro?.endereco || ""}
                            onChange={(e) => setEditingMembro({...editingMembro, endereco: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={editingMembro?.aceitou_jesus || false}
                            onCheckedChange={(checked) => setEditingMembro({...editingMembro, aceitou_jesus: checked})}
                          />
                          <Label>Aceitou Jesus</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={editingMembro?.reconciliou_jesus || false}
                            onCheckedChange={(checked) => setEditingMembro({...editingMembro, reconciliou_jesus: checked})}
                          />
                          <Label>Reconciliou com Jesus</Label>
                        </div>
                        <div>
                          <Label>Notas</Label>
                          <Textarea
                            value={editingMembro?.notas || ""}
                            onChange={(e) => setEditingMembro({...editingMembro, notas: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <Button 
                          className="w-full gradient-primary"
                          onClick={handleEditMembro}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Membros;
