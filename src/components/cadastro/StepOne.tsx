import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CadastroData } from "@/pages/Cadastro";
import { Mail, Phone, User, Lock } from "lucide-react";

interface StepOneProps {
  data: Partial<CadastroData>;
  onNext: (data: Partial<CadastroData>) => void;
}

export const StepOne = ({ data, onNext }: StepOneProps) => {
  const [nome, setNome] = useState(data.nome || "");
  const [email, setEmail] = useState(data.email || "");
  const [telefone, setTelefone] = useState(data.telefone || "");
  const [senha, setSenha] = useState(data.senha || "");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    // Remove +55 se já existir para reprocessar
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!email.trim()) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email inválido";
    if (!telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    if (!senha) newErrors.senha = "Senha é obrigatória";
    else if (senha.length < 6) newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    if (senha !== confirmSenha) newErrors.confirmSenha = "As senhas não coincidem";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ nome, email, telefone, senha });
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
            💡 <strong>Já tem uma Casa de Fé?</strong> Use o mesmo email e senha para cadastrar outra.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
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
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
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

        <div>
          <Label htmlFor="senha">Criar Senha</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.senha && (
            <p className="text-destructive text-sm mt-1">{errors.senha}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmSenha">Confirmar Senha</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmSenha"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              className="pl-10"
            />
          </div>
          {errors.confirmSenha && (
            <p className="text-destructive text-sm mt-1">{errors.confirmSenha}</p>
          )}
        </div>
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full">
        Próximo Passo →
      </Button>
    </form>
  );
};
