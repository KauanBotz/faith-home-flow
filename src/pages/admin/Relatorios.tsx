import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Download } from "lucide-react";
import { toast } from "sonner";

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: isAdminData, error } = await supabase.rpc("is_admin");
      
      if (error || !isAdminData) {
        toast.error("Acesso negado");
        navigate("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      navigate("/login");
    }
  };

  const handleExportPDF = () => {
    toast.info("Funcionalidade de exportar PDF em desenvolvimento");
  };

  const handleExportExcel = () => {
    toast.info("Funcionalidade de exportar Excel em desenvolvimento");
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Relatórios</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Relatório Geral</h3>
                <p className="text-sm text-muted-foreground">
                  Todas as casas de fé e membros
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Relatório de Frequência</h3>
                <p className="text-sm text-muted-foreground">
                  Presenças por período
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Relatório por Campus</h3>
                <p className="text-sm text-muted-foreground">
                  Dados agrupados por campus
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Relatório de Conversões</h3>
                <p className="text-sm text-muted-foreground">
                  Membros que aceitaram Jesus
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminRelatorios;
