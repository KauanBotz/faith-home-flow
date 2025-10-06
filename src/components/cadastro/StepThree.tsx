import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CadastroData } from "@/pages/Cadastro";
import { Plus, Trash2, User, Phone, MapPin, Hash } from "lucide-react";

interface StepThreeProps {
  data: Partial<CadastroData>;
  onNext: (data: Partial<CadastroData>) => void;
  onBack: () => void;
}

interface Membro {
  nome: string;
  telefone: string;
  idade: number;
  endereco: string;
  convertido: boolean;
  notas?: string;
}

export const StepThree = ({ data, onNext, onBack }: StepThreeProps) => {
  const [membros, setMembros] = useState<Membro[]>(
    data.membros || [
      { nome: "", telefone: "", idade: 0, endereco: "", convertido: false, notas: "" }
    ]
  );

  const addMembro = () => {
    if (membros.length < 50) {
      setMembros([
        ...membros,
        { nome: "", telefone: "", idade: 0, endereco: "", convertido: false, notas: "" }
      ]);
    }
  };

  const removeMembro = (index: number) => {
    if (membros.length > 1) {
      setMembros(membros.filter((_, i) => i !== index));
    }
  };

  const updateMembro = (index: number, field: keyof Membro, value: any) => {
    const updated = [...membros];
    updated[index] = { ...updated[index], [field]: value };
    setMembros(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Membros são opcionais agora
    onNext({ membros: membros.filter(m => m.nome.trim()) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cadastro dos Membros (Opcional)</h2>
        <p className="text-muted-foreground">
          Quem vai estar na sua Casa de Fé? 🙌 Você pode adicionar depois se preferir!
        </p>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {membros.map((membro, index) => (
          <Card key={index} className="p-4 space-y-4 relative">
            {membros.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMembro(index)}
                className="absolute top-2 right-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor={`nome-${index}`}>Nome Completo</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={`nome-${index}`}
                    value={membro.nome}
                    onChange={(e) => updateMembro(index, "nome", e.target.value)}
                    placeholder="Nome do membro"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`telefone-${index}`}>Telefone</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={`telefone-${index}`}
                      value={membro.telefone}
                      onChange={(e) => updateMembro(index, "telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`idade-${index}`}>Idade</Label>
                  <div className="relative mt-1.5">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={`idade-${index}`}
                      type="number"
                      min="0"
                      value={membro.idade || ""}
                      onChange={(e) => updateMembro(index, "idade", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`endereco-${index}`}>Endereço</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={`endereco-${index}`}
                    value={membro.endereco}
                    onChange={(e) => updateMembro(index, "endereco", e.target.value)}
                    placeholder="Endereço do membro"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor={`convertido-${index}`} className="cursor-pointer">
                  Já é convertido?
                </Label>
                <Switch
                  id={`convertido-${index}`}
                  checked={membro.convertido}
                  onCheckedChange={(checked) => updateMembro(index, "convertido", checked)}
                />
              </div>

              <div>
                <Label htmlFor={`notas-${index}`}>Notas (opcional)</Label>
                <Textarea
                  id={`notas-${index}`}
                  value={membro.notas}
                  onChange={(e) => updateMembro(index, "notas", e.target.value)}
                  placeholder="Observações sobre o membro..."
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {membros.length < 50 && (
        <Button
          type="button"
          variant="outline"
          onClick={addMembro}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Membro ({membros.length}/50)
        </Button>
      )}

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          onClick={onBack}
          className="flex-1"
        >
          ← Voltar
        </Button>
        <Button type="submit" variant="hero" size="lg" className="flex-1">
          Próximo Passo →
        </Button>
      </div>
    </form>
  );
};
