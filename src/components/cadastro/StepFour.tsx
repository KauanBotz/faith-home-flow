import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CadastroData } from "@/pages/Cadastro";
import { Home, User, MapPin, Building, Network, Clock, Users, CheckCircle2, Calendar } from "lucide-react";

interface StepFourProps {
  data: CadastroData;
  onSubmit: () => void;
  onBack: () => void;
}

export const StepFour = ({ data, onSubmit, onBack }: StepFourProps) => {
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = () => {
    if (acceptTerms) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Confirmação</h2>
        <p className="text-muted-foreground">
          Revise seus dados antes de finalizar
        </p>
      </div>

      <div className="space-y-4">
        {/* Dados do Facilitador */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Seus Dados</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-medium">{data.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="font-medium">{data.telefone}</span>
            </div>
          </div>
        </Card>

        {/* Dados da Casa de Fé */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">Casa de Fé</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{data.endereco}</span>
            </div>
            <div className="flex gap-2">
              <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{data.campus}</span>
            </div>
            <div className="flex gap-2">
              <Network className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{data.rede}</span>
            </div>
            <div className="flex gap-2">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span>{data.horarioReuniao}</span>
            </div>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {data.diasSemana?.map((dia, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                    {dia.replace('-feira', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Membros */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-success" />
            <h3 className="font-semibold">
              Membros ({data.membros?.length || 0})
            </h3>
          </div>
          <div className="space-y-2 text-sm max-h-[200px] overflow-y-auto">
            {data.membros?.map((membro, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="font-medium">{membro.nome}</span>
                {membro.convertido && (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Termos */}
        <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
          />
          <label htmlFor="terms" className="text-sm cursor-pointer">
            Li e concordo com os termos de uso e políticas de privacidade da MINC. 
            Autorizo o uso dos meus dados para fins de gestão das Casas de Fé.
          </label>
        </div>
      </div>

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
        <Button 
          onClick={handleSubmit}
          variant="hero" 
          size="lg" 
          className="flex-1"
          disabled={!acceptTerms}
        >
          Finalizar e Criar Casa de Fé
        </Button>
      </div>
    </div>
  );
};
