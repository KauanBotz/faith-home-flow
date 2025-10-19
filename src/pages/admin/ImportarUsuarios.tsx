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
      const response = await fetch("/FINAL.csv");
      const csvText = await response.text();

      const linhas = csvText.split("\n");
      const inserts: string[] = [];
      const emailsUnicos = new Set();

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        const valores = [];
        let valorAtual = "";
        let dentroDeAspas = false;

        for (let j = 0; j < linha.length; j++) {
          const char = linha[j];

          if (char === '"') {
            dentroDeAspas = !dentroDeAspas;
          } else if (char === "," && !dentroDeAspas) {
            valores.push(valorAtual);
            valorAtual = "";
          } else {
            valorAtual += char;
          }
        }
        valores.push(valorAtual);

        if (valores.length < 4) continue;

        const email = (valores[3] || "").trim();
        if (!email || emailsUnicos.has(email)) continue;
        emailsUnicos.add(email);

        // Usa a função auth.sign_up do Supabase
        const insert = `select auth.sign_up(
  email := '${email}',
  password := '123456'
);`;

        inserts.push(insert);
      }

      const sqlCompleto = inserts.join("\n\n");
      setSqlOutput(sqlCompleto);
      toast.success(`${inserts.length} usuários prontos para criação via auth.sign_up()!`);
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
          Gera comandos SQL usando <code>auth.sign_up()</code> (provider email).
        </p>

        <div className="space-y-4">
          <Button onClick={processarCSV} disabled={loading}>
            {loading ? "Processando..." : "Gerar SQL auth.sign_up()"}
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
                  <li>Execute com a role <strong>supabase_admin</strong></li>
                  <li>Depois rode o script das casas_fe</li>
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
