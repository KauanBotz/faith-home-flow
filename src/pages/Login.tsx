import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Sparkles, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Login = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCasaSelection, setShowCasaSelection] = useState(false);
  const [casasFe, setCasasFe] = useState<any[]>([]);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se é email ou telefone
      const isEmail = emailOrPhone.includes("@");
      let loginEmail = emailOrPhone;

      if (!isEmail) {
        // É telefone - buscar email correspondente
        const { data: casaData, error: casaError } = await supabase
          .from("casas_fe")
          .select("email")
          .eq("telefone", emailOrPhone)
          .limit(1)
          .maybeSingle();

        if (casaError || !casaData) {
          toast.error("Telefone não encontrado. Verifique o número digitado.");
          setLoading(false);
          return;
        }

        loginEmail = casaData.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: "123456", // Senha padrão
      });

      if (error) throw error;

      toast.success("Login realizado. Graça e paz!");
      
      if (loginEmail === "admin@mincbh.com.br") {
        navigate("/admin/dashboard");
      } else {
        // Verificar quantas casas de fé o usuário tem
        const { data: casasData, error: casasError } = await supabase
          .from("casas_fe")
          .select("*")
          .eq("user_id", data.user.id);

        if (casasError) throw casasError;

        if (casasData && casasData.length > 1) {
          // Mais de uma casa - mostrar seleção (sem duplicação)
          const casasUnicas = Array.from(new Map(casasData.map(casa => [casa.id, casa])).values());
          setCasasFe(casasUnicas);
          setShowCasaSelection(true);
        } else {
          // Apenas uma casa - ir direto
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha atualizada com sucesso!");
      setShowResetPassword(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error("Erro ao atualizar senha: " + error.message);
    }
  };

  const handleSelectCasa = (casaId: string) => {
    // Salvar casa selecionada no localStorage
    localStorage.setItem("selected_casa_id", casaId);
    setShowCasaSelection(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-subtle flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 shadow-glow border-primary/10 backdrop-blur-sm bg-card/95">
          <div className="text-center mb-8">
            <div className="w-[140px] h-[140px] mx-auto rounded-2xl flex items-center justify-center animate-fade-in">              
              <img src="icon.png" alt="" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bem-vindo de volta!
            </h1>
          <p className="text-muted-foreground text-xs flex items-center justify-center gap-2">
              Minha Igreja Na Cidade.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-center">
                <strong>Senha padrão: 123456</strong><br />
                Após o login, você poderá redefinir sua senha.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" className="text-base font-semibold">Email ou Telefone</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  id="emailOrPhone"
                  type="text"
                  placeholder="seu@email.com ou +55 (00) 00000-0000"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold gradient-primary hover:shadow-glow transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                </>
              )}
            </Button>

            <div className="text-center pt-6 border-t border-primary/10 space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResetPassword(true)}
                className="text-primary hover:underline"
              >
                Redefinir Senha (opcional)
              </Button>
              
              <p className="text-sm text-muted-foreground">Ainda não tem cadastro?</p>
              <Link to="/cadastro" className="block">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full h-12 border-2 border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary font-semibold transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Criar Casa de Fé
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/70">
            Feito com 💛 por{" "}
            <a 
              href="https://linkedin.com/in/kauanvaaz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors font-medium hover:underline"
            >
              Kauan Gabriel
            </a>
          </p>
        </div>
      </div>

      {/* Dialog de Seleção de Casa */}
      <Dialog open={showCasaSelection} onOpenChange={setShowCasaSelection}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecione uma Casa de Fé</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {casasFe.map((casa) => (
              <Card
                key={casa.id}
                className="p-4 cursor-pointer hover:bg-accent/5 transition-all"
                onClick={() => handleSelectCasa(casa.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{casa.nome_lider}</p>
                    <p className="text-sm text-muted-foreground">{casa.campus} - {casa.rede}</p>
                    <p className="text-xs text-muted-foreground">{casa.endereco}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Redefinir Senha */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Mínimo 6 caracteres</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetPassword(false)}>
                Cancelar
              </Button>
              <Button onClick={handleResetPassword}>
                Atualizar Senha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;