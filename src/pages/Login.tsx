import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Home, Sparkles } from "lucide-react";

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

      toast.success("Login realizado com sucesso!");
      
      // Check if admin
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
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-medium">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta!</h1>
            <p className="text-muted-foreground">
              Entre na sua Casa de Fé
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-base">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 text-base"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="senha" className="text-base">Senha</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-11 h-12 text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base gradient-primary hover:shadow-glow transition-smooth"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-center text-sm pt-4 border-t space-y-2">
              <div>
                <span className="text-muted-foreground">Ainda não tem cadastro? </span>
                <Link to="/cadastro" className="text-primary font-semibold hover:underline">
                  Criar Casa de Fé
                </Link>
              </div>
              <div>
                <Link to="/setup-admin" className="text-muted-foreground text-xs hover:underline">
                  Criar usuário admin
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
