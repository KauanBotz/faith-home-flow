const fs = require('fs');
const { parse } = require('csv-parse/sync');
const crypto = require('crypto');

// Lê o arquivo CSV
const csvContent = fs.readFileSync('./public/FINAL.csv', 'utf-8');

// Parse do CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

const inserts = [];

records.forEach((row, index) => {
  const userId = crypto.randomUUID();
  
  // Limpar e processar dados
  const nome = row['Nome']?.trim() || '';
  const tipoDoc = row['Tipo do documento']?.trim() || '';
  const numDoc = row['Número do documento']?.trim() || '';
  const email = row['Email']?.trim() || '';
  const telefone = row['WhatsApp do FACILITADOR 1 (com DDD e sem traços)']?.trim().replace(/[^0-9]/g, '') || '';
  const redeFac1 = row['Rede/MINC do FACILITADOR 1']?.trim() || '';
  const batizado1 = row['O FACILITADOR 1 é batizado(a)?']?.trim().toUpperCase() === 'SIM';
  const nomeDupla = row['Nome completo do FACILITADOR 2']?.trim() || null;
  const telefoneDupla = row['WhatsApp do FACILITADOR 2 (com DDD e sem traços)']?.trim().replace(/[^0-9]/g, '') || null;
  const redeFac2 = row['Rede/MINC do FACILITADOR 2']?.trim() || null;
  const batizado2 = row['O FACILITADOR 2 é batizado (a)?']?.trim().toUpperCase() === 'SIM';
  const nomeAnfitriao = row['Nome completo do ANFITRIÃO da Casa de Fé']?.trim() || null;
  const whatsappAnfitriao = row['WhatsApp do ANFITRIÃO (com DDD e sem traços)']?.trim().replace(/[^0-9]/g, '') || null;
  const rua = row['Rua/Avenida da Casa de Fé']?.trim() || '';
  const numero = row['Número da Casa de Fé']?.trim() || '';
  const bairro = row['Bairro da Casa de Fé']?.trim() || '';
  const cep = row['CEP da Casa de Fé']?.trim().replace(/[^0-9]/g, '') || '';
  const cidade = row['Cidade da Casa de Fé']?.trim() || '';
  const pontoRef = row['Ponto de referência da Casa de Fé']?.trim() || null;

  // Escapar aspas simples para SQL
  const escape = (str) => str ? str.replace(/'/g, "''") : '';

  // Construir endereço completo
  const endereco = `${rua}, ${numero} - ${bairro}, ${cidade} - CEP: ${cep}`;

  // Valores padrão para campos obrigatórios
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
  '${escape(nome)}',
  ${tipoDoc ? `'${escape(tipoDoc)}'` : 'NULL'},
  ${numDoc ? `'${escape(numDoc)}'` : 'NULL'},
  '${escape(email)}',
  '${telefone}',
  ${redeFac1 ? `'${escape(redeFac1)}'` : 'NULL'},
  ${batizado1},
  ${nomeDupla ? `'${escape(nomeDupla)}'` : 'NULL'},
  ${telefoneDupla ? `'${telefoneDupla}'` : 'NULL'},
  ${redeFac2 ? `'${escape(redeFac2)}'` : 'NULL'},
  ${batizado2},
  ${nomeAnfitriao ? `'${escape(nomeAnfitriao)}'` : 'NULL'},
  ${whatsappAnfitriao ? `'${whatsappAnfitriao}'` : 'NULL'},
  ${rua ? `'${escape(rua)}'` : 'NULL'},
  ${numero ? `'${escape(numero)}'` : 'NULL'},
  ${bairro ? `'${escape(bairro)}'` : 'NULL'},
  ${cep ? `'${cep}'` : 'NULL'},
  ${cidade ? `'${escape(cidade)}'` : 'NULL'},
  ${pontoRef ? `'${escape(pontoRef)}'` : 'NULL'},
  '${escape(endereco)}',
  '${campus}',
  '${escape(rede)}',
  '${horarioReuniao}',
  '${diasSemana}',
  '${geracao}'
);`;

  inserts.push(insert);
});

// Escrever para arquivo
const sqlOutput = inserts.join('\n\n');
fs.writeFileSync('./inserts-casas-fe.sql', sqlOutput);
