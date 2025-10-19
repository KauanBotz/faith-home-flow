import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://YOUR-PROJECT.supabase.co',
  'YOUR-SERVICE-ROLE-KEY'
)

const ImportarUsersAuth = () => {
  const [loading, setLoading] = useState(false);

  const processarCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch("/FINAL.csv");
      const csvText = await response.text();

      const linhas = csvText.split("\n");
      const emailsUnicos = new Set();
      let criados = 0;

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        const valores = linha.split(","); // simplificado
        if (valores.length < 4) continue;

        const email = valores[3].trim();
        if (!email || emailsUnicos.has(email)) continue;
        emailsUnicos.add(email);

        // Cria usuário via Admin API
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: "123456",
        });
        if (error) {
          console.error("Erro ao criar usuário:", email, error.message);
        } else {
          criados++;
        }
      }

      toast.success(`${criados} usuários criados com sucesso!`);
    } catch (error) {
      toast.error("Erro ao processar CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Importar Users Auth do CSV</h1>
        <Button onClick={processarCSV} disabled={loading}>
          {loading ? "Processando..." : "Criar usuários"}
        </Button>
      </Card>
    </div>
  );
};

export default ImportarUsersAuth;
