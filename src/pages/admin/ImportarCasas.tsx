import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://ibycvtowlvwmgyzoveef.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieWN2dG93bHZ3bWd5em92ZWVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTY2NzMyOCwiZXhwIjoyMDc1MjQzMzI4fQ.LRn4OigxjhMvmYjd-DEft80Yb_CNmP8DpjK7Ug_6BE4'
);

const ImportarCasas = () => {
  const [sqlOutput, setSqlOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const processarCSV = async () => {
    setLoading(true);
    try {
      
      // Buscar TODOS os usuários (com paginação)
      const emailToUid = new Map<string, string>();
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const { data: { users: pageUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 1000
        });
        
        if (authError) {
          console.error('❌ Erro ao buscar usuários:', authError);
          toast.error('Erro ao buscar usuários da auth');
          return;
        }
        
        
        pageUsers?.forEach(user => {
          if (user.email && user.id) {
            emailToUid.set(user.email.toLowerCase(), user.id);
          }
        });
        
        // Se retornou menos que 1000, não tem mais páginas
        hasMore = (pageUsers?.length || 0) === 1000;
        page++;
      }
      
      const response = await fetch('/versao2.csv');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      const linhas = csvText.split('\n');
      
      const inserts: string[] = [];
      const erros: string[] = [];

      // Pular a primeira linha (cabeçalho)
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;

        // Parse CSV com respeito a vírgulas dentro de aspas
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

        if (valores.length < 20) {
          continue;
        }

        // Escapar aspas simples para SQL
        const escape = (str: string | null | undefined) => 
          str ? str.trim().replace(/'/g, "''") : '';

        // Buscar UID pelo email na tabela users_auth
        const emailRaw = valores[3]?.trim();
        let userId = crypto.randomUUID(); // fallback caso não encontre
        
        if (i <= 5) { // Log detalhado das primeiras 5 linhas
        }
        
        if (emailRaw) {
          const emailLower = emailRaw.toLowerCase();
          const foundUid = emailToUid.get(emailLower);
          
          if (foundUid) {
            userId = foundUid;
            if (i <= 5) {
            }
          } else {
            if (i <= 5) {
              // Mostrar emails parecidos
              const similares = Array.from(emailToUid.keys())
                .filter(e => e.includes(emailLower.split('@')[0].substring(0, 5)))
                .slice(0, 3);
              if (similares.length > 0) {
              }
            }
          }
        } else {
          if (i <= 5) {
          }
        }
        
        // Extrair e limpar dados
        const nome = escape(valores[0]);
        const tipoDoc = escape(valores[1]);
        const numDoc = escape(valores[2]);
        const emailEscaped = escape(valores[3]);
        const telefone = (valores[4] || '').replace(/[^0-9]/g, '');
        const redeFac1 = escape(valores[5]);
        const batizado1 = (valores[6] || '').toUpperCase().includes('SIM');
        const nomeDupla = escape(valores[7]);
        const telefoneDupla = (valores[8] || '').replace(/[^0-9]/g, '');
        const redeFac2 = escape(valores[9]);
        const batizado2 = (valores[10] || '').toUpperCase().includes('SIM');
        const nomeAnfitriao = escape(valores[11]);
        const whatsappAnfitriao = (valores[12] || '').replace(/[^0-9]/g, '');
        const rua = escape(valores[13]);
        const numero = escape(valores[14]);
        const bairro = escape(valores[15]);
        const cep = (valores[16] || '').replace(/[^0-9]/g, '');
        const cidade = escape(valores[18]);
        const pontoRef = escape(valores[19]);

        // Construir endereço completo
        const endereco = escape(`${rua}, ${numero} - ${bairro}, ${cidade} - CEP: ${cep}`);

        // Valores padrão
        const campus = 'MINC Belo Horizonte';
        const rede = redeFac1 || 'Sem rede';
        const horarioReuniao = '19:00:00';
        const diasSemana = '{}';
        const geracao = 'Primeira';

        const insert = `INSERT INTO casas_fe (
  user_id, nome_lider, tipo_documento, numero_documento, email, telefone,
  rede_facilitador_1, facilitador_1_batizado, nome_dupla, telefone_dupla,
  rede_facilitador_2, facilitador_2_batizado, nome_anfitriao, whatsapp_anfitriao,
  rua_avenida, numero_casa, bairro, cep, cidade, ponto_referencia,
  endereco, campus, rede, horario_reuniao, dias_semana, geracao
) VALUES (
  '${userId}',
  ${nome ? `'${nome}'` : 'NULL'},
  ${tipoDoc ? `'${tipoDoc}'` : 'NULL'},
  ${numDoc ? `'${numDoc}'` : 'NULL'},
  ${emailEscaped ? `'${emailEscaped}'` : 'NULL'},
  ${telefone ? `'${telefone}'` : 'NULL'},
  ${redeFac1 ? `'${redeFac1}'` : 'NULL'},
  ${batizado1},
  ${nomeDupla ? `'${nomeDupla}'` : 'NULL'},
  ${telefoneDupla ? `'${telefoneDupla}'` : 'NULL'},
  ${redeFac2 ? `'${redeFac2}'` : 'NULL'},
  ${batizado2},
  ${nomeAnfitriao ? `'${nomeAnfitriao}'` : 'NULL'},
  ${whatsappAnfitriao ? `'${whatsappAnfitriao}'` : 'NULL'},
  ${rua ? `'${rua}'` : 'NULL'},
  ${numero ? `'${numero}'` : 'NULL'},
  ${bairro ? `'${bairro}'` : 'NULL'},
  ${cep ? `'${cep}'` : 'NULL'},
  ${cidade ? `'${cidade}'` : 'NULL'},
  ${pontoRef ? `'${pontoRef}'` : 'NULL'},
  '${endereco}',
  '${campus}',
  '${rede}',
  '${horarioReuniao}',
  '${diasSemana}',
  '${geracao}'
);`;

        inserts.push(insert);
      }

      const sqlCompleto = inserts.join('\n\n');
      setSqlOutput(sqlCompleto);
      
      let mensagem = `${inserts.length} INSERTs gerados!`;
      if (erros.length > 0) {
        mensagem += `\n${erros.length} erros encontrados (veja console)`;
        console.error('📋 Lista de erros:', erros);
      }
      
      toast.success(mensagem);
    } catch (error) {
      console.error('💥 ERRO CRÍTICO:', error);
      toast.error(`Erro ao processar CSV: ${error}`);
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
        <h1 className="text-2xl font-bold mb-4">Importar Casas de Fé do CSV</h1>
        <p className="mb-4 text-muted-foreground">
          Processa o arquivo versao2.csv e gera comandos SQL INSERT. Busca user_id existente pelo email.
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
                  <li>Clique em "Copiar SQL" acima</li>
                  <li>Acesse o <a 
                    href="https://supabase.com/dashboard/project/ibycvtowlvwmgyzoveef/sql/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Supabase SQL Editor
                  </a></li>
                  <li>Cole o SQL e execute</li>
                </ol>
                <p className="text-sm mt-3 text-muted-foreground">
                  <strong>Nota:</strong> O sistema busca user_id existente pelo email. Se encontrar, usa aquele ID. 
                  Se não encontrar, gera um novo UUID. Casas duplicadas são permitidas!
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImportarCasas;