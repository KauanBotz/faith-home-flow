// Utilitários para formatação de telefone

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 0) return '';
  
  const localNumbers = numbers.startsWith('55') ? numbers.slice(2) : numbers;
  
  if (localNumbers.length <= 2) {
    return `+55 (${localNumbers}`;
  } else if (localNumbers.length <= 7) {
    return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2)}`;
  } else if (localNumbers.length <= 11) {
    return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2, 7)}-${localNumbers.slice(7, 11)}`;
  }
  
  return `+55 (${localNumbers.slice(0, 2)}) ${localNumbers.slice(2, 7)}-${localNumbers.slice(7, 11)}`;
};

export const formatPhoneToWhatsApp = (phone: string): string => {
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Se já começa com 55, usa direto
  if (numbers.startsWith('55')) {
    return `https://wa.me/${numbers}`;
  }
  
  // Senão, adiciona o 55
  return `https://wa.me/55${numbers}`;
};

export const getPhoneNumbers = (phone: string): string => {
  // Retorna apenas os números, garantindo formato 55XXXXXXXXXXX
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.startsWith('55')) {
    return numbers;
  }
  
  return `55${numbers}`;
};
