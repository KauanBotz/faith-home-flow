import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://ibycvtowlvwmgyzoveef.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieWN2dG93bHZ3bWd5em92ZWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY2NzMyOCwiZXhwIjoyMDc1MjQzMzI4fQ.LRn4OigxjhMvmYjd-DEft80Yb_CNmP8DpjK7Ug_6BE4'
)

const ImportarUsersAuth = () => {
  const [loading, setLoading] = useState(false);

  const processarCSV = async () => {
    setLoading(true);
    try {
      // 1. Pega user_id e email da tabela casas_fe
      const { data: casasFe, error: casasError } = await supabaseAdmin
        .from("casas_fe")
        .select("user_id, email");

      if (casasError) throw casasError;

      // Cria mapa email -> user_id
      const emailToId: Record<string, string> = {};
      casasFe.forEach((c: any) => {
        emailToId[c.email] = c.user_id;
      });

      // 2. Lê CSV
      const response = await fetch("/FINAL.csv");
      const csvText = await response.text();
      const linhas = csvText.split("\n");

      const emailsUnicos = new Set<string>();
      let criados = 0;

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        const valores = linha.split(",");
        if (valores.length < 4) continue;

        const email = valores[3].trim();
        if (!email || emailsUnicos.has(email)) continue;
        emailsUnicos.add(email);

        const id = emailToId[email];
        if (!id) {
          console.warn("Email não encontrado na tabela casas_fe:", email);
          continue;
        }

        // Cria usuário via Admin API
        const { error } = await supabaseAdmin.auth.admin.createUser({
          id: id,
          email,
          password: "123456",
          email_confirm: true
        });

        if (error) {
          console.error("Erro ao criar usuário:", email, error.message);
        } else {
          criados++;
        }
      }

      toast.success(`${criados} usuários criados com sucesso!`);
    } catch (error: any) {
      console.error(error);
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
