import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, MapPin, Hash } from "lucide-react";

interface AddMembroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casaFeId: string;
  onSuccess: () => void;
}

export const AddMembroDialog = ({ open, onOpenChange, casaFeId, onSuccess }: AddMembroDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    idade: 0,
    endereco: "",
    aceitou_jesus: false,
    notas: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("membros").insert({
        casa_fe_id: casaFeId,
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        idade: formData.idade,
        endereco: formData.endereco,
        aceitou_jesus: formData.aceitou_jesus,
        notas: formData.notas || null,
      });

      if (error) throw error;

      toast.success("Membro adicionado com sucesso!");
      onOpenChange(false);
      setFormData({
        nome_completo: "",
        telefone: "",
        idade: 0,
        endereco: "",
        aceitou_jesus: false,
        notas: "",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error adding membro:", error);
      toast.error("Erro ao adicionar membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo membro da Casa de Fé.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo</Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="nome"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                placeholder="Nome do membro"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="idade">Idade</Label>
              <div className="relative mt-1.5">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="idade"
                  type="number"
                  min="0"
                  value={formData.idade || ""}
                  onChange={(e) => setFormData({ ...formData, idade: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Endereço do membro"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Observações sobre o membro..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar Membro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
