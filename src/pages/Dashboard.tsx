import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, LogOut, User, MapPin, Clock, Sparkles, TrendingUp, FileText } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [casaFe, setCasaFe] = useState<any>(null);
  const [membrosCount, setMembrosCount] = useState(0);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: casaData, error: casaError } = await supabase
        .from("casas_fe")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (casaError) throw casaError;
      setCasaFe(casaData);

      if (casaData) {
        const { count } = await supabase
          .from("membros")
          .select("*", { count: "exact", head: true })
          .eq("casa_fe_id", casaData.id);
        
        setMembrosCount(count || 0);
      }
    } catch (error: any) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary animate-pulse shadow-glow" />
          <p className="text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Header Premium */}
      <header className="bg-card/95 backdrop-blur-sm shadow-soft border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Minha Casa de Fé
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo, {casaFe?.nome_lider}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Hero Card */}
        <Card className="p-8 mb-8 shadow-glow border-primary/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{casaFe?.nome_lider}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {casaFe?.campus}
                    </p>
                  </div>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Geração</p>
                <p className="font-semibold text-primary">{casaFe?.geracao || 'Primeira'}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Endereço</p>
                <p className="font-semibold">{casaFe?.endereco}</p>
              </div>
              {casaFe?.rede && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Rede</p>
                  <p className="font-semibold">{casaFe?.rede}</p>
                </div>
              )}
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Horário</p>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {casaFe?.horario_reuniao}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">{membrosCount}</p>
                <p className="text-sm text-muted-foreground font-medium">Total de Membros</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-success" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">
                  {casaFe?.dias_semana?.[0] || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Dia de Reunião</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium hover:shadow-glow transition-all relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold mb-1">1</p>
                <p className="text-sm text-muted-foreground font-medium">Casa de Fé Ativa</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button
            size="lg"
            onClick={() => navigate("/membros")}
            className="h-20 text-lg gradient-primary hover:shadow-glow transition-all hover:scale-[1.02]"
          >
            <Users className="w-6 h-6 mr-3" />
            Ver Membros
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/presenca")}
            className="h-20 text-lg hover:bg-accent/5 hover:border-accent transition-all hover:scale-[1.02]"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Registrar Presença
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/relatorio")}
            className="h-20 text-lg hover:bg-secondary/5 hover:border-secondary transition-all hover:scale-[1.02]"
          >
            <FileText className="w-6 h-6 mr-3" />
            Enviar Relatório
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/perfil")}
            className="h-20 text-lg hover:bg-success/5 hover:border-success transition-all hover:scale-[1.02]"
          >
            <User className="w-6 h-6 mr-3" />
            Editar Perfil
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
