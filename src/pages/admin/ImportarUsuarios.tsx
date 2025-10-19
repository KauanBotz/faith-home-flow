import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ImportarUsersAuth = () => {
  const [sqlOutput, setSqlOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const processarCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch('/FINAL.csv');
      const csvText = await response.text();
      
      const linhas = csvText.split('\n');
      const inserts: string[] = [];

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        const valores = [];
        let valorAtual = '';
        let dentroDeAspas = false;

        for (let j = 0; j < linha.length; j++) {
          const char = linha[j];
          
          if (char === '"') {
            dentroDeAspas = !dentroDeAspas;
          } else if (char === ',' && !dentroDeAspas) {
            valores.push(valorAtual);
            valorAtual = '';
          } else {
            valorAtual += char;
          }
        }
        valores.push(valorAtual);

        if (valores.length < 4) continue;

        const userId = crypto.randomUUID();
        const email = (valores[3] || '').trim();
        
        if (!email) continue;

        const insert = `INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '${userId}',
  '${email}',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  'authenticated',
  'authenticated'
);`;

        inserts.push(insert);
      }

      const sqlCompleto = inserts.join('\n\n');
      setSqlOutput(sqlCompleto);
      toast.success(`${inserts.length} INSERTs de usuários gerados!`);
    } catch (error) {
      toast.error("Erro ao processar CSV");
    } finally {
      setLoading(false);
    }
  };

  const copiarSQL = () => {
    navigator.clipboard.writeText(sqlOutput);
    toast.success("SQL copiado!");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Importar Users Auth do CSV</h1>
        <p className="mb-4 text-muted-foreground">
          Gera INSERTs na tabela auth.users com senha temporária.
        </p>
        
        <div className="space-y-4">
          <Button onClick={processarCSV} disabled={loading}>
            {loading ? "Processando..." : "Gerar SQL INSERT"}
          </Button>
          
          {sqlOutput && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">SQL Gerado:</h2>
                <Button onClick={copiarSQL} variant="outline" size="sm">
                  Copiar SQL
                </Button>
              </div>
              <Textarea
                value={sqlOutput}
                readOnly
                className="font-mono text-xs h-96"
              />
              <div className="bg-primary/10 p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Instruções:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Copie o SQL acima</li>
                  <li>Cole no Supabase SQL Editor</li>
                  <li>Execute primeiro este script de users</li>
                  <li>Depois execute o script das casas_fe</li>
                </ol>
                <p className="text-sm mt-3 text-muted-foreground">
                  <strong>Senha temporária:</strong> 123456 (usuários devem alterar no primeiro login)
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImportarUsersAuth;