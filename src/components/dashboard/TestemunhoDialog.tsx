import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface TestemunhoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casaFeId: string;
  onSaved: () => void;
}

export function TestemunhoDialog({ open, onOpenChange, casaFeId, onSaved }: TestemunhoDialogProps) {
  const [nomePessoa, setNomePessoa] = useState("");
  const [testemunho, setTestemunho] = useState("");
  const [dataTestemunho, setDataTestemunho] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nomePessoa.trim() || !testemunho.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("testemunhos")
        .insert({
          casa_fe_id: casaFeId,
          nome_pessoa: nomePessoa,
          testemunho,
          data_testemunho: dataTestemunho
        });

      if (error) throw error;

      toast.success("Testemunho adicionado!");
      setNomePessoa("");
      setTestemunho("");
      setDataTestemunho(format(new Date(), "yyyy-MM-dd"));
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao salvar testemunho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Testemunho</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={dataTestemunho}
              onChange={(e) => setDataTestemunho(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="nome">Nome da Pessoa</Label>
            <Input
              id="nome"
              value={nomePessoa}
              onChange={(e) => setNomePessoa(e.target.value)}
              placeholder="Nome de quem deu o testemunho"
            />
          </div>

          <div>
            <Label htmlFor="testemunho">Testemunho</Label>
            <Textarea
              id="testemunho"
              value={testemunho}
              onChange={(e) => setTestemunho(e.target.value)}
              placeholder="Compartilhe o testemunho..."
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