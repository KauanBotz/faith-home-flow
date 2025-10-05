import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CadastroData } from "@/pages/Cadastro";
import { MapPin, Building, Network, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

export const StepTwo = ({ data, onNext, onBack }: StepTwoProps) => {
  const [endereco, setEndereco] = useState(data.endereco || "");
  const [campus, setCampus] = useState(data.campus || "");
  const [rede, setRede] = useState(data.rede || "");
  const [horarioReuniao, setHorarioReuniao] = useState(data.horarioReuniao || "");
  const [datasReunioes, setDatasReunioes] = useState<Date[]>(data.datasReunioes || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!campus) newErrors.campus = "Campus é obrigatório";
    if (!rede) newErrors.rede = "Rede é obrigatória";
    if (!horarioReuniao) newErrors.horarioReuniao = "Horário é obrigatório";
    if (datasReunioes.length === 0) newErrors.datasReunioes = "Selecione pelo menos uma data de reunião";

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
        datasReunioes
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const isSelected = datasReunioes.some(d => 
      d.toDateString() === date.toDateString()
    );
    
    if (isSelected) {
      setDatasReunioes(datasReunioes.filter(d => 
        d.toDateString() !== date.toDateString()
      ));
    } else {
      setDatasReunioes([...datasReunioes, date].sort((a, b) => a.getTime() - b.getTime()));
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
          <Label htmlFor="datas">Datas das Reuniões</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1.5",
                  datasReunioes.length === 0 && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {datasReunioes.length > 0
                  ? `${datasReunioes.length} data(s) selecionada(s)`
                  : "Selecione as datas das reuniões"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="multiple"
                selected={datasReunioes}
                onSelect={(dates) => {
                  if (dates) {
                    setDatasReunioes(Array.isArray(dates) ? dates.sort((a, b) => a.getTime() - b.getTime()) : [dates]);
                  } else {
                    setDatasReunioes([]);
                  }
                }}
                disabled={(date) => {
                  const oct20 = new Date(2024, 9, 20);
                  const nov14 = new Date(2024, 10, 14);
                  return date < oct20 || date > nov14;
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {datasReunioes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {datasReunioes.map((data, index) => (
                <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {format(data, "dd/MM/yyyy", { locale: pt })}
                  <button
                    type="button"
                    onClick={() => {
                      setDatasReunioes(datasReunioes.filter(d => d.getTime() !== data.getTime()));
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.datasReunioes && (
            <p className="text-destructive text-sm mt-1">{errors.datasReunioes}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Selecione as datas entre 20 de outubro e 14 de novembro
          </p>
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
        <Button type="submit" variant="hero" size="lg" className="flex-1">
          Próximo Passo →
        </Button>
      </div>
    </form>
  );
};
