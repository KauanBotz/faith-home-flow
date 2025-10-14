import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface PalavraPastorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palavra?: any;
  onSaved: () => void;
}

export function PalavraPastorDialog({ open, onOpenChange, palavra, onSaved }: PalavraPastorDialogProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [dataPublicacao, setDataPublicacao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (palavra) {
      setTitulo(palavra.titulo);
      setConteudo(palavra.conteudo);
      setDataPublicacao(palavra.data_publicacao);
    } else {
      setTitulo("");
      setConteudo("");
      setDataPublicacao(format(new Date(), "yyyy-MM-dd"));
    }
  }, [palavra, open]);

  const handleSave = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      if (palavra) {
        // Editar
        const { error } = await supabase
          .from("palavra_pastor")
          .update({
            titulo,
            conteudo,
            data_publicacao: dataPublicacao
          })
          .eq("id", palavra.id);

        if (error) throw error;
        toast.success("Palavra do Pastor atualizada!");
      } else {
        // Criar
        const { error } = await supabase
          .from("palavra_pastor")
          .insert({
            titulo,
            conteudo,
            data_publicacao: dataPublicacao
          });

        if (error) throw error;
        toast.success("Palavra do Pastor adicionada!");
      }

      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving palavra:", error);
      toast.error("Erro ao salvar palavra do pastor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {palavra ? "Editar" : "Adicionar"} Palavra do Pastor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="data">Data de Publicação</Label>
            <Input
              id="data"
              type="date"
              value={dataPublicacao}
              onChange={(e) => setDataPublicacao(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: A importância da Fé"
            />
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo (Markdown)</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Use markdown para formatar. Ex: **negrito**, *itálico*, ## Subtítulo"
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Suporta Markdown: **negrito**, *itálico*, ## Título, - lista
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}