import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Sparkles, FileText } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"email" | "documento">("email");
  const [email, setEmail] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CPF");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [senha, setSenha] = useState("123456");
  const [loading, setLoading] = useState(false);

  const tiposDocumento = ["CPF", "RG", "CNH", "Passaporte", "Outro"];

  const formatDocumento = (value: string, tipo: string) => {
    const numbers = value.replace(/\D/g, "");
    let formatted = value;

    if (tipo === "CPF") {
      if (numbers.length <= 11) {
        formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      }
    } else if (tipo === "RG") {
      if (numbers.length <= 9) {
        formatted = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
    } else if (tipo === "CNH") {
      formatted = numbers.slice(0, 11);
    } else if (tipo === "Passaporte") {
      const letters = value.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
      const nums = numbers.slice(0, 6);
      formatted = letters + nums;
    } else {
      formatted = value;
    }

    return formatted;
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocumento(e.target.value, tipoDocumento);
    setNumeroDocumento(formatted);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail === "admin@mincbh.com.br") {
      setSenha("");
    } else {
      setSenha("123456");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    localStorage.removeItem("selected_casa_id");

    try {
      if (loginType === "email") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: senha
        });

        if (error) throw error;

        toast.success("Login realizado. Graça e paz!");
        
        if (email === "admin@mincbh.com.br") {
          navigate("/admin/dashboard");
        } else {
          const userId = data.user.id;
          const { data: casasData, error: casasError } = await supabase
            .from("casas_fe")
            .select("*")
            .or(`user_id.eq.${userId},email.eq.${email},email_dupla.eq.${email}`);

          if (casasError) throw casasError;

          localStorage.removeItem("selected_casa_id");

          if (!casasData || casasData.length === 0) {
            toast.error("Nenhuma Casa de Fé encontrada para este email");
            return;
          }

          sessionStorage.setItem("multi_casas_list", JSON.stringify(casasData));
          navigate("/selecionar-casa");
        }
      } else {
        // Login por documento
        const docLimpo = numeroDocumento.replace(/\D/g, "");
        
        const { data: allCasas, error: fetchError } = await supabase
          .from("casas_fe")
          .select("*");

        if (fetchError) {
          toast.error("Erro ao buscar dados!");
          return;
        }

        const casasData = allCasas?.filter(casa => {
          if (!casa.numero_documento) return false;
          
          const casaDoc = casa.numero_documento.replace(/\D/g, "");
          
          return casaDoc === docLimpo;
        });

        if (!casasData || casasData.length === 0) {
          toast.error("Documento não encontrado!");
          return;
        }

        // Login com a primeira casa encontrada
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: casasData[0].email,
          password: "123456",
        });
        
        if (loginError) {
          toast.error("Erro ao entrar. Verifique as credenciais.");
          return;
        }

        toast.success("Login realizado. Graça e paz!");

        // Busca todas as casas autenticadas
        const userId = loginData.user.id;
        const { data: todasCasas, error: casasError } = await supabase
          .from("casas_fe")
          .select("*")
          .eq("user_id", userId);

        if (casasError) throw casasError;

        // Filtra novamente só as que têm o documento
        const casasAutenticadas = todasCasas?.filter(casa => {
          if (!casa.numero_documento) return false;
          
          const casaDoc = casa.numero_documento.replace(/\D/g, "");
          
          return casaDoc === docLimpo;
        });

        if (!casasAutenticadas || casasAutenticadas.length === 0) {
          toast.error("Erro ao carregar casas!");
          return;
        }

        if (casasAutenticadas.length > 1) {
          sessionStorage.setItem("multi_casas_list", JSON.stringify(casasAutenticadas));
          navigate("/selecionar-casa");
        } else {
          localStorage.setItem("user_id", casasAutenticadas[0].user_id);
          localStorage.setItem("selected_casa_id", casasAutenticadas[0].id);
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const shouldShowPasswordField = email === "admin@mincbh.com.br";

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
              Minha Igreja Na Cidade
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
              variant={loginType === "documento" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setLoginType("documento")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Documento
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
                    onChange={handleEmailChange}
                    className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tipoDoc" className="text-base font-semibold">Tipo de Documento</Label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger className="h-12 border-primary/20">
                      <SelectValue placeholder="Selecione" />
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
                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-base font-semibold">Número do Documento</Label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="documento"
                      type="text"
                      placeholder={
                        tipoDocumento === "CPF" ? "000.000.000-00" :
                        tipoDocumento === "RG" ? "00.000.000-0" :
                        tipoDocumento === "CNH" ? "00000000000" :
                        tipoDocumento === "Passaporte" ? "AA000000" : "Digite o documento"
                      }
                      value={numeroDocumento}
                      onChange={handleDocumentoChange}
                      className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {shouldShowPasswordField && (
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-base font-semibold">Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-11 h-12 text-base border-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
            )}

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
              <p className="text-xs text-gray-500">
                Dificuldade para acessar ou encontrou algum problema?<br></br>{" "}
                <a 
                  href="https://wa.me/5531975410027" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Fale com a Secretaria MINC
                </a>
              </p>
            </div>
          </form>
        </Card>

        <div className="mt-5 text-center">
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