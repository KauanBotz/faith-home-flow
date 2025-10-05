import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroData } from "@/pages/Cadastro";
import { MapPin, Building, Network, Clock, Calendar } from "lucide-react";

interface StepTwoProps {
  data: Partial<CadastroData>;
  onNext: (data: Partial<CadastroData>) => void;
  onBack: () => void;
}

const campusOptions = [
  "MINC Pampulha",
  "MINC Lagoa Santa",
  "MINC São José da Lapa",
  "MINC Ribeirão das Neves",
  "MINC Rio",
  "MINC São Paulo",
  "MINC Juiz de Fora",
  "MINC Online",
  "MINC Sinop",
];

const redeOptions = [
  "Gerar (MINC Pampulha)",
  "Ative (MINC Pampulha)",
  "Avance (MINC Pampulha)",
  "Nexo (MINC Pampulha)",
  "Plug (MINC Pampulha)",
  "MINC Lagoa Santa",
  "MINC São José da Lapa",
  "MINC Ribeirão das Neves",
  "MINC Rio",
  "MINC São Paulo",
  "MINC Juiz de Fora",
  "MINC Online",
  "MINC Sinop",
];

const diasDaSemana = [
  { value: "Segunda-feira", label: "Segunda" },
  { value: "Terça-feira", label: "Terça" },
  { value: "Quarta-feira", label: "Quarta" },
  { value: "Quinta-feira", label: "Quinta" },
  { value: "Sexta-feira", label: "Sexta" },
];

export const StepTwo = ({ data, onNext, onBack }: StepTwoProps) => {
  const [endereco, setEndereco] = useState(data.endereco || "");
  const [campus, setCampus] = useState(data.campus || "");
  const [rede, setRede] = useState(data.rede || "");
  const [horarioReuniao, setHorarioReuniao] = useState(data.horarioReuniao || "");
  const [diaSemana, setDiaSemana] = useState<string>(data.diasSemana?.[0] || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!campus) newErrors.campus = "Campus é obrigatório";
    if (!rede) newErrors.rede = "Rede é obrigatória";
    if (!horarioReuniao) newErrors.horarioReuniao = "Horário é obrigatório";
    if (!diaSemana) newErrors.diaSemana = "Selecione o dia da semana";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ 
        endereco, 
        campus, 
        rede, 
        horarioReuniao,
        diasSemana: [diaSemana]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dados da Casa de Fé</h2>
        <p className="text-muted-foreground">
          Onde vai acontecer?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="endereco">Endereço Completo</Label>
          <div className="relative mt-1.5">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="endereco"
              type="text"
              placeholder="Rua, número, bairro, cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.endereco && (
            <p className="text-destructive text-sm mt-1">{errors.endereco}</p>
          )}
        </div>

        <div>
          <Label htmlFor="campus">Campus</Label>
          <div className="relative mt-1.5">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={campus} onValueChange={setCampus}>
              <SelectTrigger id="campus" className="pl-10">
                <SelectValue placeholder="Selecione o campus" />
              </SelectTrigger>
              <SelectContent>
                {campusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.campus && (
            <p className="text-destructive text-sm mt-1">{errors.campus}</p>
          )}
        </div>

        <div>
          <Label htmlFor="rede">Rede</Label>
          <div className="relative mt-1.5">
            <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={rede} onValueChange={setRede}>
              <SelectTrigger id="rede" className="pl-10">
                <SelectValue placeholder="Selecione a rede" />
              </SelectTrigger>
              <SelectContent>
                {redeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.rede && (
            <p className="text-destructive text-sm mt-1">{errors.rede}</p>
          )}
        </div>

        <div>
          <Label htmlFor="horario">Horário das Reuniões</Label>
          <div className="relative mt-1.5">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="horario"
              type="time"
              value={horarioReuniao}
              onChange={(e) => setHorarioReuniao(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.horarioReuniao && (
            <p className="text-destructive text-sm mt-1">{errors.horarioReuniao}</p>
          )}
        </div>

        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            Dia da Reunião
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {diasDaSemana.map((dia) => (
              <Button
                key={dia.value}
                type="button"
                variant={diaSemana === dia.value ? "default" : "outline"}
                className="w-full"
                onClick={() => setDiaSemana(dia.value)}
              >
                {dia.label}
              </Button>
            ))}
          </div>
          {diaSemana && (
            <div className="mt-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {diasDaSemana.find(d => d.value === diaSemana)?.label}
              </span>
            </div>
          )}
          {errors.diaSemana && (
            <p className="text-destructive text-sm mt-1">{errors.diaSemana}</p>
          )}
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
          <span className="mr-2">←</span> Voltar
        </Button>
        <Button type="submit" variant="hero" size="lg" className="flex-1">
          Próximo Passo <span className="ml-2">→</span>
        </Button>
      </div>
    </form>
  );
};
