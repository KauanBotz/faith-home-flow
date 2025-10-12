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
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="pl-10"
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
