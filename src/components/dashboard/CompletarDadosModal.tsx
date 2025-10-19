import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogPortal } from "@/components/ui/alert-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Home } from "lucide-react";
import { formatPhone } from "@/lib/phoneUtils";
import { cn } from "@/lib/utils";

interface CompletarDadosModalProps {
  casaFe: any;
  open: boolean;
  onComplete: () => void;
}

export const CompletarDadosModal = ({ casaFe, open, onComplete }: CompletarDadosModalProps) => {
  const [dadosEditaveis, setDadosEditaveis] = useState(casaFe);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDadosEditaveis(casaFe);
  }, [casaFe]);

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhone(value);
    setDadosEditaveis({ ...dadosEditaveis, [field]: formatted });
  };

  const verificarDadosPendentes = () => {
    const camposPendentes = [];
    
    if (!dadosEditaveis?.telefone_dupla?.trim()) camposPendentes.push("Telefone do Facilitador 2");
    if (!dadosEditaveis?.whatsapp_anfitriao?.trim()) camposPendentes.push("WhatsApp do Anfitrião");
    if (!dadosEditaveis?.cep?.trim()) camposPendentes.push("CEP");
    if (!dadosEditaveis?.rua_avenida?.trim()) camposPendentes.push("Rua/Avenida");
    if (!dadosEditaveis?.numero_casa?.trim()) camposPendentes.push("Número da Casa");
    if (!dadosEditaveis?.bairro?.trim()) camposPendentes.push("Bairro");
    if (!dadosEditaveis?.cidade?.trim()) camposPendentes.push("Cidade");
    
    return camposPendentes;
  };

  const handleSalvar = async () => {
    const pendentes = verificarDadosPendentes();
    
    if (pendentes.length > 0) {
      toast.error(`Preencha os seguintes campos: ${pendentes.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const enderecoCompleto = `${dadosEditaveis.rua_avenida}, ${dadosEditaveis.numero_casa} - ${dadosEditaveis.bairro}, ${dadosEditaveis.cidade} - CEP: ${dadosEditaveis.cep}`;
      
      const { error } = await supabase
        .from("casas_fe")
        .update({
          telefone_dupla: dadosEditaveis.telefone_dupla,
          whatsapp_anfitriao: dadosEditaveis.whatsapp_anfitriao,
          cep: dadosEditaveis.cep,
          rua_avenida: dadosEditaveis.rua_avenida,
          numero_casa: dadosEditaveis.numero_casa,
          bairro: dadosEditaveis.bairro,
          cidade: dadosEditaveis.cidade,
          ponto_referencia: dadosEditaveis.ponto_referencia,
          nome_anfitriao: dadosEditaveis.nome_anfitriao,
          nome_dupla: dadosEditaveis.nome_dupla,
          email_dupla: dadosEditaveis.email_dupla,
          endereco: enderecoCompleto,
        })
        .eq("id", casaFe.id);

      if (error) throw error;
      
      toast.success("Dados salvos! Você pode editar depois em 'Editar Casa de Fé' no menu.");
      onComplete();
    } catch (error: any) {
      toast.error("Erro ao salvar dados");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogPortal>
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={(e) => e.preventDefault()}
        />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            "max-h-[90vh] p-0"
          )}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="p-6 pb-4 border-b">
            <AlertDialogPrimitive.Title className="text-2xl font-semibold">
              Complete os Dados da Casa de Fé
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-base text-muted-foreground mt-2">
              Algumas informações estão pendentes. Preencha todos os campos obrigatórios abaixo.
              <br />
              <strong className="text-primary">💡 Você poderá editar esses dados depois em "Editar Casa de Fé" no menu.</strong>
            </AlertDialogPrimitive.Description>
          </div>

        <ScrollArea className="h-[calc(90vh-200px)] px-6">
          <div className="space-y-6 py-4">
            {/* Facilitador 2 */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Facilitador 2 (Dupla)
              </h3>
              
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={dadosEditaveis?.nome_dupla || ""}
                  onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, nome_dupla: e.target.value })}
                  placeholder="Nome do Facilitador 2"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Telefone *</Label>
                <Input
                  value={dadosEditaveis?.telefone_dupla || ""}
                  onChange={(e) => handlePhoneChange("telefone_dupla", e.target.value)}
                  placeholder="+55 (00) 00000-0000"
                  maxLength={19}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  value={dadosEditaveis?.email_dupla || ""}
                  onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, email_dupla: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Anfitrião */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Home className="w-5 h-5" />
                Anfitrião da Casa de Fé
              </h3>
              
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={dadosEditaveis?.nome_anfitriao || ""}
                  onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, nome_anfitriao: e.target.value })}
                  placeholder="Nome do anfitrião"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>WhatsApp *</Label>
                <Input
                  value={dadosEditaveis?.whatsapp_anfitriao || ""}
                  onChange={(e) => handlePhoneChange("whatsapp_anfitriao", e.target.value)}
                  placeholder="+55 (00) 00000-0000"
                  maxLength={19}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço da Casa de Fé
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Rua/Avenida *</Label>
                  <Input
                    value={dadosEditaveis?.rua_avenida || ""}
                    onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, rua_avenida: e.target.value })}
                    placeholder="Nome da rua ou avenida"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Número *</Label>
                  <Input
                    value={dadosEditaveis?.numero_casa || ""}
                    onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, numero_casa: e.target.value })}
                    placeholder="Número"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Bairro *</Label>
                  <Input
                    value={dadosEditaveis?.bairro || ""}
                    onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, bairro: e.target.value })}
                    placeholder="Bairro"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>CEP *</Label>
                  <Input
                    value={dadosEditaveis?.cep || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const formatted = value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5, 8)}` : value;
                      setDadosEditaveis({ ...dadosEditaveis, cep: formatted });
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={dadosEditaveis?.cidade || ""}
                    onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                    className="mt-1.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Ponto de Referência</Label>
                  <Input
                    value={dadosEditaveis?.ponto_referencia || ""}
                    onChange={(e) => setDadosEditaveis({ ...dadosEditaveis, ponto_referencia: e.target.value })}
                    placeholder="Ex: Próximo ao mercado X"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t">
          <Button 
            onClick={handleSalvar} 
            disabled={saving}
            size="lg"
            className="w-full"
          >
            {saving ? "Salvando..." : "Salvar e Continuar"}
          </Button>
        </div>
      </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
};