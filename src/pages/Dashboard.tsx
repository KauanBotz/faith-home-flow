import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, LogOut, User } from "lucide-react";
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
    toast.success("Até logo! 👋");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Minha Casa de Fé</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Líder</p>
                <p className="text-xl font-bold">{casaFe?.nome_lider}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membros</p>
                <p className="text-xl font-bold">{membrosCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="text-xl font-bold">{casaFe?.campus}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate("/membros")}
          >
            <Users className="w-5 h-5 mr-2" />
            Ver Membros
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/presenca")}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Registrar Presença
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/perfil")}
          >
            <User className="w-5 h-5 mr-2" />
            Editar Perfil
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
