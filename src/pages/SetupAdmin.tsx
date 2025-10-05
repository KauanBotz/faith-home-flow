import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

const SetupAdmin = () => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreateAdmin = async () => {
    setCreating(true);
    try {
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: "admin@mincbh.com.br",
        password: "M1nc@2025#CasasDeFe!",
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
          data: {
            email_verified: true,
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Usuário não foi criado");
      }

      // Insert admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "admin",
        });

      if (roleError) {
        console.error("Role error:", roleError);
        // Don't throw, role might already exist
      }

      toast.success("Admin criado com sucesso!");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Erro ao criar admin");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-medium text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Setup Admin</h1>
        <p className="text-muted-foreground mb-6">
          Criar usuário administrador do sistema
        </p>

        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-left text-sm">
          <p className="font-semibold mb-2">Credenciais:</p>
          <p>Email: admin@mincbh.com.br</p>
          <p>Senha: M1nc@2025#CasasDeFe!</p>
        </div>

        <Button
          onClick={handleCreateAdmin}
          disabled={creating}
          size="lg"
          className="w-full gradient-primary"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando Admin...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Criar Admin
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/login")}
          className="w-full mt-3"
        >
          Voltar para Login
        </Button>
      </Card>
    </div>
  );
};

export default SetupAdmin;
