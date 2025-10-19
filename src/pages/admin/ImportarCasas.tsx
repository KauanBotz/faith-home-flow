import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ImportarCasas = () => {
  const [sqlOutput, setSqlOutput] = useState("");

  const processarCSV = () => {
    // Dados do CSV FINAL.csv
    const csvData = `Nome,Tipo do documento,Número do documento,Email,WhatsApp do FACILITADOR 1 (com DDD e sem traços),Rede/MINC do FACILITADOR 1,O FACILITADOR 1 é batizado(a)?,Nome completo do FACILITADOR 2,WhatsApp do FACILITADOR 2 (com DDD e sem traços),Rede/MINC do FACILITADOR 2,O FACILITADOR 2 é batizado (a)?,Nome completo do ANFITRIÃO da Casa de Fé,WhatsApp do ANFITRIÃO (com DDD e sem traços),Rua/Avenida da Casa de Fé,Número da Casa de Fé,Bairro da Casa de Fé,CEP da Casa de Fé,COMPROMISSO,Cidade da Casa de Fé,Ponto de referência da Casa de Fé
1 Jairo Luciano Lourenço da Costa ,CPF,968.501.086-20,jairolucianu@gmail.com,318909-9837,Gerar (Pampulha),SIM,BRENDA E ELIANE,31989099837,Gerar (Pampulha),SIM,Geiza,31 98330-6461,rua Sertãozinho,222,Jardim Leblon,31540180,"Confirmo que estarei comprometido(a), junto com meu facilitador (a), em iniciar e concluir a Casa de Fé pelo período de 4 semanas do projeto evangelístico.",Belo Horizonte,Proximo da Casa do Vitor`;

    const linhas = csvData.split('\n');
    const headers = linhas[0].split(',');
    
    let inserts: string[] = [];

    for (let i = 1; i < linhas.length; i++) {
      const valores = linhas[i].split(',');
      
      if (valores.length < 20) continue;

      const userId = crypto.randomUUID();
      const nome = valores[0]?.trim() || '';
      const tipoDoc = valores[1]?.trim() || '';
      const numDoc = valores[2]?.trim() || '';
      const email = valores[3]?.trim() || '';
      const telefone = valores[4]?.trim().replace(/[^0-9]/g, '') || '';
      const redeFac1 = valores[5]?.trim() || '';
      const batizado1 = valores[6]?.trim().toUpperCase() === 'SIM' ? 'true' : 'false';
      const nomeDupla = valores[7]?.trim() || null;
      const telefoneDupla = valores[8]?.trim().replace(/[^0-9]/g, '') || null;
      const redeFac2 = valores[9]?.trim() || null;
      const batizado2 = valores[10]?.trim().toUpperCase() === 'SIM' ? 'true' : 'false';
      const nomeAnfitriao = valores[11]?.trim() || null;
      const whatsappAnfitriao = valores[12]?.trim().replace(/[^0-9]/g, '') || null;
      const rua = valores[13]?.trim() || '';
      const numero = valores[14]?.trim() || '';
      const bairro = valores[15]?.trim() || '';
      const cep = valores[16]?.trim().replace(/[^0-9]/g, '') || '';
      const cidade = valores[18]?.trim() || '';
      const pontoRef = valores[19]?.trim() || null;

      // Construir endereço completo
      const endereco = `${rua}, ${numero} - ${bairro}, ${cidade} - CEP: ${cep}`;

      // Valores padrão para campos obrigatórios
      const campus = 'MINC Belo Horizonte';
      const rede = redeFac1 || 'Sem rede';
      const horarioReuniao = '19:00:00';
      const diasSemana = "'{}'";
      const geracao = 'Primeira';

      const insert = `INSERT INTO casas_fe (
  user_id, nome_lider, tipo_documento, numero_documento, email, telefone,
  rede_facilitador_1, facilitador_1_batizado, nome_dupla, telefone_dupla,
  rede_facilitador_2, facilitador_2_batizado, nome_anfitriao, whatsapp_anfitriao,
  rua_avenida, numero_casa, bairro, cep, cidade, ponto_referencia,
  endereco, campus, rede, horario_reuniao, dias_semana, geracao
) VALUES (
  '${userId}',
  ${nome ? `'${nome.replace(/'/g, "''")}'` : 'NULL'},
  ${tipoDoc ? `'${tipoDoc.replace(/'/g, "''")}'` : 'NULL'},
  ${numDoc ? `'${numDoc.replace(/'/g, "''")}'` : 'NULL'},
  ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'},
  ${telefone ? `'${telefone}'` : 'NULL'},
  ${redeFac1 ? `'${redeFac1.replace(/'/g, "''")}'` : 'NULL'},
  ${batizado1},
  ${nomeDupla ? `'${nomeDupla.replace(/'/g, "''")}'` : 'NULL'},
  ${telefoneDupla ? `'${telefoneDupla}'` : 'NULL'},
  ${redeFac2 ? `'${redeFac2.replace(/'/g, "''")}'` : 'NULL'},
  ${batizado2},
  ${nomeAnfitriao ? `'${nomeAnfitriao.replace(/'/g, "''")}'` : 'NULL'},
  ${whatsappAnfitriao ? `'${whatsappAnfitriao}'` : 'NULL'},
  ${rua ? `'${rua.replace(/'/g, "''")}'` : 'NULL'},
  ${numero ? `'${numero.replace(/'/g, "''")}'` : 'NULL'},
  ${bairro ? `'${bairro.replace(/'/g, "''")}'` : 'NULL'},
  ${cep ? `'${cep}'` : 'NULL'},
  ${cidade ? `'${cidade.replace(/'/g, "''")}'` : 'NULL'},
  ${pontoRef ? `'${pontoRef.replace(/'/g, "''")}'` : 'NULL'},
  '${endereco.replace(/'/g, "''")}',
  '${campus}',
  '${rede.replace(/'/g, "''")}',
  '${horarioReuniao}',
  ${diasSemana},
  '${geracao}'
);`;

      inserts.push(insert);
    }

    const sqlCompleto = inserts.join('\n\n');
    setSqlOutput(sqlCompleto);
    toast.success(`${inserts.length} INSERTs gerados com sucesso!`);
  };

  const copiarSQL = () => {
    navigator.clipboard.writeText(sqlOutput);
    toast.success("SQL copiado para a área de transferência!");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Importar Casas de Fé</h1>
        <p className="mb-4">
          Este script processa o arquivo CSV e gera os comandos SQL INSERT para você colar no Supabase.
        </p>
        
        <div className="space-y-4">
          <Button onClick={processarCSV}>Gerar SQL INSERT</Button>
          
          {sqlOutput && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">SQL Gerado:</h2>
                <Button onClick={copiarSQL} variant="outline">
                  Copiar SQL
                </Button>
              </div>
              <Textarea
                value={sqlOutput}
                readOnly
                className="font-mono text-sm h-96"
              />
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm">
                  <strong>Instruções:</strong>
                  <br />
                  1. Copie o SQL acima
                  <br />
                  2. Acesse o Supabase SQL Editor: https://supabase.com/dashboard/project/ibycvtowlvwmgyzoveef/sql/new
                  <br />
                  3. Cole o SQL e execute
                  <br />
                  <br />
                  <strong>Nota:</strong> Os campos campus, rede, horario_reuniao e dias_semana foram preenchidos com valores padrão.
                  Os usuários podem editar esses campos depois do login na página de Perfil.
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
