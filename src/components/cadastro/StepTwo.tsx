import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroData } from "@/pages/Cadastro";
import { MapPin, Building, Network, Clock, Calendar, Users, Phone, Mail, Info } from "lucide-react";

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
];

const redeOptions = [
  "Gerar",
  "Gerações",
  "Ative",
  "Avance",
  "Nexo",
  "Plug"
];

const diasDaSemana = [
  { value: "Segunda-feira", label: "Segunda" },
  { value: "Terça-feira", label: "Terça" },
  { value: "Quarta-feira", label: "Quarta" },
  { value: "Quinta-feira", label: "Quinta" },
  { value: "Sexta-feira", label: "Sexta" },
  { value: "Sábado", label: "Sábado" },
];

export const StepTwo = ({ data, onNext, onBack }: StepTwoProps) => {
  const [endereco, setEndereco] = useState(data.endereco || "");
  const [campus, setCampus] = useState(data.campus || "");
  const [rede, setRede] = useState(data.rede || "");
  const [horarioReuniao, setHorarioReuniao] = useState(data.horarioReuniao || "");
  const [diaSemana, setDiaSemana] = useState<string>(data.diasSemana?.[0] || "");
  const [nomeDupla, setNomeDupla] = useState(data.nomeDupla || "");
  const [telefoneDupla, setTelefoneDupla] = useState(data.telefoneDupla || "");
  const [emailDupla, setEmailDupla] = useState(data.emailDupla || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    const localNumbers = numbers.startsWith('55') ? numbers.slice(2) : numbers;
    
    if (localNumbers.length <= 2) {
      return `+55 (${localNumbers}`;
    } else if (localNumbers.length <= 7) {
      return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2)}`;
    } else if (localNumbers.length <= 11) {
      return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2, 7)}-${localNumbers.slice(7, 11)}`;
    }
    
    return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2, 7)}-${localNumbers.slice(7, 11)}`;
  };

  const handlePhoneDuplaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefoneDupla(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!campus) newErrors.campus = "Campus é obrigatório";
    if (campus === "MINC Pampulha" && !rede) newErrors.rede = "Rede é obrigatória para MINC Pampulha";
    if (!horarioReuniao) newErrors.horarioReuniao = "Horário é obrigatório";
    if (!diaSemana) newErrors.diaSemana = "Selecione o dia da semana";
    if (!nomeDupla.trim()) newErrors.nomeDupla = "Nome da dupla é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ 
        endereco, 
        campus, 
        rede: campus === "MINC Pampulha" ? rede : "", 
        horarioReuniao,
        diasSemana: [diaSemana],
        nomeDupla: nomeDupla || undefined,
        telefoneDupla: telefoneDupla || undefined,
        emailDupla: emailDupla || undefined,
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
            <Select value={campus} onValueChange={(value) => {
              setCampus(value);
              if (value !== "MINC Pampulha") {
                setRede("");
              }
            }}>
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

        {campus === "MINC Pampulha" && (
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
        )}

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

        {/* Dados da Dupla */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Sua Dupla
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeDupla">Nome da Dupla</Label>
              <div className="relative mt-1.5">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nomeDupla"
                  type="text"
                  placeholder="Nome completo"
                  value={nomeDupla}
                  onChange={(e) => setNomeDupla(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.nomeDupla && (
                <p className="text-destructive text-sm mt-1">{errors.nomeDupla}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefoneDupla">Telefone da Dupla</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefoneDupla"
                  type="tel"
                  placeholder="+55 (00) 00000-0000"
                  value={telefoneDupla}
                  onChange={handlePhoneDuplaChange}
                  className="pl-10"
                  maxLength={19}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emailDupla">Email da Dupla</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="emailDupla"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={emailDupla}
                  onChange={(e) => setEmailDupla(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-muted/50 border border-muted rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Caso você não tenha dupla, entre em contato com a{" "}
                <a 
                  href="https://wa.me/5531975410027" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Secretaria MINC
                </a>.
              </p>
            </div>
          </div>
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
