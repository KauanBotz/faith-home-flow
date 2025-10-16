import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CadastroData } from "@/pages/Cadastro";
import { MapPin, Building, Network, Clock, Calendar, Users, Phone, Mail, Info, Home } from "lucide-react";

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
  // Casa de Fé
  const [campus, setCampus] = useState(data.campus || "");
  const [rede, setRede] = useState(data.rede || "");
  const [horarioReuniao, setHorarioReuniao] = useState(data.horarioReuniao || "");
  const [diaSemana, setDiaSemana] = useState<string>(data.diasSemana?.[0] || "");
  
  // Facilitador 1 (usuário)
  const [redeMincFacilitador1, setRedeMincFacilitador1] = useState(data.redeMincFacilitador1 || "");
  const [facilitador1Batizado, setFacilitador1Batizado] = useState(data.facilitador1Batizado || false);
  
  // Facilitador 2 (dupla)
  const [nomeDupla, setNomeDupla] = useState(data.nomeDupla || "");
  const [telefoneDupla, setTelefoneDupla] = useState(data.telefoneDupla || "");
  const [redeMincFacilitador2, setRedeMincFacilitador2] = useState(data.redeMincFacilitador2 || "");
  const [facilitador2Batizado, setFacilitador2Batizado] = useState(data.facilitador2Batizado || false);
  
  // Anfitrião
  const [nomeAnfitriao, setNomeAnfitriao] = useState(data.nomeAnfitriao || "");
  const [whatsappAnfitriao, setWhatsappAnfitriao] = useState(data.whatsappAnfitriao || "");
  
  // Endereço detalhado
  const [ruaAvenida, setRuaAvenida] = useState(data.ruaAvenida || "");
  const [numeroCasa, setNumeroCasa] = useState(data.numeroCasa || "");
  const [bairro, setBairro] = useState(data.bairro || "");
  const [cep, setCep] = useState(data.cep || "");
  const [cidade, setCidade] = useState(data.cidade || "");
  const [pontoReferencia, setPontoReferencia] = useState(data.pontoReferencia || "");
  
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

  const handlePhoneAnfitriaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setWhatsappAnfitriao(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!campus) newErrors.campus = "Campus é obrigatório";
    if (!redeMincFacilitador1) newErrors.redeMincFacilitador1 = "Rede/MINC do Facilitador 1 é obrigatório";
    if (!nomeDupla.trim()) newErrors.nomeDupla = "Nome do Facilitador 2 é obrigatório";
    if (!telefoneDupla.trim()) newErrors.telefoneDupla = "WhatsApp do Facilitador 2 é obrigatório";
    if (!redeMincFacilitador2) newErrors.redeMincFacilitador2 = "Rede/MINC do Facilitador 2 é obrigatório";
    if (!nomeAnfitriao.trim()) newErrors.nomeAnfitriao = "Nome do Anfitrião é obrigatório";
    if (!whatsappAnfitriao.trim()) newErrors.whatsappAnfitriao = "WhatsApp do Anfitrião é obrigatório";
    if (!ruaAvenida.trim()) newErrors.ruaAvenida = "Rua/Avenida é obrigatória";
    if (!numeroCasa.trim()) newErrors.numeroCasa = "Número da casa é obrigatório";
    if (!bairro.trim()) newErrors.bairro = "Bairro é obrigatório";
    if (!cep.trim()) newErrors.cep = "CEP é obrigatório";
    if (!cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    if (!pontoReferencia.trim()) newErrors.pontoReferencia = "Ponto de referência é obrigatório";
    if (!horarioReuniao) newErrors.horarioReuniao = "Horário é obrigatório";
    if (!diaSemana) newErrors.diaSemana = "Dia da semana é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const enderecoCompleto = `${ruaAvenida}, ${numeroCasa} - ${bairro}, ${cidade} - CEP: ${cep}`;
      onNext({ 
        campus, 
        rede: campus === "MINC Pampulha" ? rede : "", 
        horarioReuniao,
        diasSemana: [diaSemana],
        redeMincFacilitador1,
        facilitador1Batizado,
        nomeDupla,
        telefoneDupla,
        redeMincFacilitador2,
        facilitador2Batizado,
        nomeAnfitriao,
        whatsappAnfitriao,
        ruaAvenida,
        numeroCasa,
        bairro,
        cep,
        cidade,
        pontoReferencia,
        endereco: enderecoCompleto,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Casa de Fé</h2>
        <p className="text-muted-foreground">
          Preencha as informações completas.
        </p>
      </div>

      <div className="space-y-6">
        {/* Facilitador 1 */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Facilitador 1 (Você)
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="redeMincFacilitador1">Rede/MINC do Facilitador 1 *</Label>
              <Select value={redeMincFacilitador1} onValueChange={setRedeMincFacilitador1}>
                <SelectTrigger id="redeMincFacilitador1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {campusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.redeMincFacilitador1 && (
                <p className="text-destructive text-sm mt-1">{errors.redeMincFacilitador1}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                id="facilitador1Batizado"
                checked={facilitador1Batizado}
                onCheckedChange={(checked) => setFacilitador1Batizado(checked === true)}
              />
              <Label htmlFor="facilitador1Batizado" className="cursor-pointer">
                O Facilitador 1 é batizado(a)? *
              </Label>
            </div>
          </div>
        </div>

        {/* Facilitador 2 (Dupla) */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Facilitador 2 (Dupla)
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeDupla">Nome Completo do Facilitador 2 *</Label>
              <Input
                id="nomeDupla"
                type="text"
                placeholder="Nome completo"
                value={nomeDupla}
                onChange={(e) => setNomeDupla(e.target.value)}
              />
              {errors.nomeDupla && (
                <p className="text-destructive text-sm mt-1">{errors.nomeDupla}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefoneDupla">WhatsApp do Facilitador 2 *</Label>
              <Input
                id="telefoneDupla"
                type="tel"
                placeholder="+55 (00) 00000-0000"
                value={telefoneDupla}
                onChange={handlePhoneDuplaChange}
                maxLength={19}
              />
              {errors.telefoneDupla && (
                <p className="text-destructive text-sm mt-1">{errors.telefoneDupla}</p>
              )}
            </div>

            <div>
              <Label htmlFor="redeMincFacilitador2">Rede/MINC do Facilitador 2 *</Label>
              <Select value={redeMincFacilitador2} onValueChange={setRedeMincFacilitador2}>
                <SelectTrigger id="redeMincFacilitador2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {campusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.redeMincFacilitador2 && (
                <p className="text-destructive text-sm mt-1">{errors.redeMincFacilitador2}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                id="facilitador2Batizado"
                checked={facilitador2Batizado}
                onCheckedChange={(checked) => setFacilitador2Batizado(checked === true)}
              />
              <Label htmlFor="facilitador2Batizado" className="cursor-pointer">
                O Facilitador 2 é batizado(a)? *
              </Label>
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

        {/* Anfitrião */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Anfitrião da Casa de Fé
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeAnfitriao">Nome Completo do Anfitrião *</Label>
              <Input
                id="nomeAnfitriao"
                type="text"
                placeholder="Nome do anfitrião"
                value={nomeAnfitriao}
                onChange={(e) => setNomeAnfitriao(e.target.value)}
              />
              {errors.nomeAnfitriao && (
                <p className="text-destructive text-sm mt-1">{errors.nomeAnfitriao}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsappAnfitriao">WhatsApp do Anfitrião *</Label>
              <Input
                id="whatsappAnfitriao"
                type="tel"
                placeholder="+55 (00) 00000-0000"
                value={whatsappAnfitriao}
                onChange={handlePhoneAnfitriaoChange}
                maxLength={19}
              />
              {errors.whatsappAnfitriao && (
                <p className="text-destructive text-sm mt-1">{errors.whatsappAnfitriao}</p>
              )}
            </div>
          </div>
        </div>

        {/* Endereço da Casa de Fé */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Endereço da Casa de Fé
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="ruaAvenida">Rua/Avenida *</Label>
              <Input
                id="ruaAvenida"
                type="text"
                placeholder="Nome da rua ou avenida"
                value={ruaAvenida}
                onChange={(e) => setRuaAvenida(e.target.value)}
              />
              {errors.ruaAvenida && (
                <p className="text-destructive text-sm mt-1">{errors.ruaAvenida}</p>
              )}
            </div>

            <div>
              <Label htmlFor="numeroCasa">Número *</Label>
              <Input
                id="numeroCasa"
                type="text"
                placeholder="Número"
                value={numeroCasa}
                onChange={(e) => setNumeroCasa(e.target.value)}
              />
              {errors.numeroCasa && (
                <p className="text-destructive text-sm mt-1">{errors.numeroCasa}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
              {errors.bairro && (
                <p className="text-destructive text-sm mt-1">{errors.bairro}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
              {errors.cep && (
                <p className="text-destructive text-sm mt-1">{errors.cep}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                type="text"
                placeholder="Nome da cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
              {errors.cidade && (
                <p className="text-destructive text-sm mt-1">{errors.cidade}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="pontoReferencia">Ponto de Referência *</Label>
              <Input
                id="pontoReferencia"
                type="text"
                placeholder="Ex: Próximo ao mercado X"
                value={pontoReferencia}
                onChange={(e) => setPontoReferencia(e.target.value)}
              />
              {errors.pontoReferencia && (
                <p className="text-destructive text-sm mt-1">{errors.pontoReferencia}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campus e Horário */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Informações da Reunião</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="campus">Campus *</Label>
              <Select value={campus} onValueChange={(value) => {
                setCampus(value);
                if (value !== "MINC Pampulha") {
                  setRede("");
                }
              }}>
                <SelectTrigger id="campus">
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
              {errors.campus && (
                <p className="text-destructive text-sm mt-1">{errors.campus}</p>
              )}
            </div>

            {campus === "MINC Pampulha" && (
              <div>
                <Label htmlFor="rede">Rede</Label>
                <Select value={rede} onValueChange={setRede}>
                  <SelectTrigger id="rede">
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
            )}

            <div>
              <Label htmlFor="horario">Horário das Reuniões *</Label>
              <Input
                id="horario"
                type="time"
                value={horarioReuniao}
                onChange={(e) => setHorarioReuniao(e.target.value)}
              />
              {errors.horarioReuniao && (
                <p className="text-destructive text-sm mt-1">{errors.horarioReuniao}</p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" />
                Dia da Reunião *
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
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          onClick={onBack}
          className="w-full sm:flex-1"
        >
          ← Voltar
        </Button>
        <Button type="submit" variant="hero" size="lg" className="w-full sm:flex-1">
          Próximo Passo →
        </Button>
      </div>
    </form>
  );
};