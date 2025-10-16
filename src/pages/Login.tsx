import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Sparkles, Home, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCasaSelection, setShowCasaSelection] = useState(false);
  const [casasFe, setCasasFe] = useState<any[]>([]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = loginType === "email" 
        ? { email, password: senha }
        : { phone: phone.replace(/\D/g, ""), password: senha };

      const { data, error } = await supabase.auth.signInWithPassword(loginData);

      if (error) throw error;

      toast.success("Login realizado. Graça e paz!");
      
      if (email === "admin@mincbh.com.br") {
        navigate("/admin/dashboard");
      } else {
        const { data: casasData, error: casasError } = await supabase
          .from("casas_fe")
          .select("*")
          .eq("user_id", data.user.id);

        if (casasError) throw casasError;

        if (casasData && casasData.length > 1) {
          setCasasFe(casasData);
          setShowCasaSelection(true);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCasa = (casaId: string) => {
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

          <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-lg">
            <Button
              type="button"
              variant={loginType === "email" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginType("email")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={loginType === "phone" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginType("phone")}
            >
              <Phone className="w-4 h-4 mr-2" />
              Telefone
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginType === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Telefone</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+55 (31) 98288-6064"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                    maxLength={19}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-base font-semibold">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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
    </div>
  );
};

export default Login;