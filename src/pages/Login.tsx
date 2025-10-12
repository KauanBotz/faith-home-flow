import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Sparkles } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      toast.success("Login realizado. Graça e paz!");
      
      if (email === "admin@mincbh.com.br") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

export default Login;