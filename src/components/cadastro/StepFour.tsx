import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CadastroData } from "@/pages/Cadastro";
import { MapPin, User, Mail, Phone, Home, Calendar, Clock, Users, Edit, Trash2, Plus } from "lucide-react";

interface StepFourProps {
  data: CadastroData;
  todasCasas?: any[];
  onSubmit: () => void;
  onBack: () => void;
  onAddAnother?: () => void;
  onEditCasa?: (casaId: string) => void;
  onDeleteCasa?: (casaId: string) => void;
}

export const StepFour = ({ data, todasCasas, onSubmit, onBack, onAddAnother, onEditCasa, onDeleteCasa }: StepFourProps) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Confirmação</h2>
        <p className="text-muted-foreground">
          Revise seus dados antes de finalizar
        </p>
      </div>

      {todasCasas && todasCasas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suas Casas de Fé ({todasCasas.length})</h3>
            {onAddAnother && (
              <Button variant="outline" size="sm" onClick={onAddAnother} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            )}
          </div>
          
          <div className="grid gap-3">
            {todasCasas.map((casa, index) => (
              <Card key={casa.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{casa.nome_lider}</p>
                        <p className="text-sm text-muted-foreground">{casa.endereco}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {casa.campus} - {casa.rede || "Sem rede"}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {onEditCasa && (
                      <Button variant="ghost" size="icon" onClick={() => onEditCasa(casa.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteCasa && (
                      <Button variant="ghost" size="icon" onClick={() => onDeleteCasa(casa.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-4 text-lg">Seus Dados</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{data.nome}</p>
              <p className="text-muted-foreground">{data.tipoDocumento}: {data.numeroDocumento}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <p>{data.email}</p>
          </div>
          
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <p>{data.telefone}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-4 text-lg">Casa de Fé</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Home className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">{data.campus}</p>
              <p className="text-muted-foreground">{data.rede}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <p>{data.endereco}</p>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <p>{data.diasSemana.join(", ")}</p>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <p>{data.horarioReuniao}</p>
          </div>
        </div>
      </Card>

      {data.membros && data.membros.length > 0 && (
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros ({data.membros.length})
          </h3>
          
          <div className="space-y-2">
            {data.membros.map((membro, index) => (
              <div key={index} className="flex items-center gap-3 text-sm p-2 rounded bg-background/50">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{membro.nome}</p>
                  <p className="text-muted-foreground">{membro.idade} anos</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <Checkbox
          id="terms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked as boolean)}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          Confirmo que estarei comprometido(a), junto com meu facilitador(a), em iniciar e concluir a Casa de Fé pelo período de 4 semanas do projeto evangelístico.
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Voltar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!accepted}
          className="flex-1 gradient-primary"
        >
          Finalizar Cadastro
        </Button>
      </div>
    </div>
  );
};
