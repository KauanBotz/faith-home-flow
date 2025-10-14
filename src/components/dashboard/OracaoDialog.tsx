import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface OracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casaFeId: string;
  onSaved: () => void;
}

export function OracaoDialog({ open, onOpenChange, casaFeId, onSaved }: OracaoDialogProps) {
  const [pedido, setPedido] = useState("");
  const [dataOracao, setDataOracao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!pedido.trim()) {
      toast.error("Preencha o pedido de oração");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("oracoes")
        .insert({
          casa_fe_id: casaFeId,
          pedido,
          data_oracao: dataOracao
        });

      if (error) throw error;

      toast.success("Pedido de oração adicionado!");
      setPedido("");
      setDataOracao(format(new Date(), "yyyy-MM-dd"));
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving oração:", error);
      toast.error("Erro ao salvar pedido de oração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Pedido de Oração</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={dataOracao}
              onChange={(e) => setDataOracao(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pedido">Pedido de Oração</Label>
            <Textarea
              id="pedido"
              value={pedido}
              onChange={(e) => setPedido(e.target.value)}
              placeholder="Compartilhe o pedido de oração..."
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}