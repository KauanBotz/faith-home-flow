import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroData } from "@/pages/Cadastro";
import { Mail, Phone, User, IdCard, CreditCard } from "lucide-react";
import { formatPhone } from "@/lib/phoneUtils";

interface StepOneProps {
  data: Partial<CadastroData>;
  onNext: (data: Partial<CadastroData>) => void;
}

const tiposDocumento = [
  "CPF",
  "RG",
  "CNH",
  "Passaporte",
  "Outro"
];

export const StepOne = ({ data, onNext }: StepOneProps) => {
  const [nome, setNome] = useState(data.nome || "");
  const [tipoDocumento, setTipoDocumento] = useState(data.tipoDocumento || "");
  const [numeroDocumento, setNumeroDocumento] = useState(data.numeroDocumento || "");
  const [email, setEmail] = useState(data.email || "");
  const [telefone, setTelefone] = useState(data.telefone || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dados_pessoais_casa_fe');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setNome(dados.nome || "");
      setTipoDocumento(dados.tipoDocumento || "");
      setNumeroDocumento(dados.numeroDocumento || "");
      setEmail(dados.email || "");
      setTelefone(dados.telefone || "");
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!tipoDocumento) newErrors.tipoDocumento = "Tipo de documento é obrigatório";
    if (!numeroDocumento.trim()) newErrors.numeroDocumento = "Número do documento é obrigatório";
    if (!email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email inválido";
    if (!telefone.trim()) newErrors.telefone = "Telefone é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ nome, tipoDocumento, numeroDocumento, email, telefone, senha: "123456" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Seus Dados</h2>
        <p className="text-muted-foreground">
          Vamos começar conhecendo você melhor.
        </p>
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-accent-foreground">
            💡 <strong>Já tem uma Casa de Fé?</strong> Use o mesmo email e os mesmos dados para cadastrar outra.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome Completo *</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.nome && (
            <p className="text-destructive text-sm mt-1">{errors.nome}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
          <div className="relative mt-1.5">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
              <SelectTrigger id="tipoDocumento" className="pl-10">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDocumento.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.tipoDocumento && (
            <p className="text-destructive text-sm mt-1">{errors.tipoDocumento}</p>
          )}
        </div>

        <div>
          <Label htmlFor="numeroDocumento">Número do Documento *</Label>
          <div className="relative mt-1.5">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="numeroDocumento"
              type="text"
              placeholder="Digite o número do documento"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.numeroDocumento && (
            <p className="text-destructive text-sm mt-1">{errors.numeroDocumento}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="telefone">WhatsApp (DDD + número sem traços) *</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="telefone"
              type="tel"
              placeholder="+55 (00) 00000-0000"
              value={telefone}
              onChange={handlePhoneChange}
              className="pl-10"
              maxLength={19}
            />
          </div>
          {errors.telefone && (
            <p className="text-destructive text-sm mt-1">{errors.telefone}</p>
          )}
        </div>
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full">
        Próximo Passo →
      </Button>
    </form>
  );
};