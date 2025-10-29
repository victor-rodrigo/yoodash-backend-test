
import { z } from 'zod';

const validMonths = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export const InvestmentGoalResponse = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Nome é obrigatório'),
  months: z.array(z.enum(validMonths)).min(1, 'Pelo menos um mês deve ser selecionado'),
  value: z.number().positive('Valor deve ser maior que zero'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const InvestmentGoalCreate = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  months: z.array(z.enum(validMonths)).min(1, 'Pelo menos um mês deve ser selecionado'),
  value: z.number().positive('Valor deve ser maior que zero')
});

export const InvestmentGoalUpdate = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres').optional(),
  months: z.array(z.enum(validMonths)).min(1, 'Pelo menos um mês deve ser selecionado').optional(),
  value: z.number().positive('Valor deve ser maior que zero').optional()
});

export const InvestmentGoalQuery = z.object({
  name: z.string().optional(),
  month: z.enum(validMonths).optional()
});

export const InvestmentGoalParams = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('ID deve ser um número inteiro positivo');
    }
    return num;
  })
});

export function validateValueDivision(totalValue, months) {
  if (!totalValue || !months || months.length === 0) {
    return { isValid: false, error: 'Valor e meses são obrigatórios' };
  }

  const monthlyValue = totalValue / months.length;
  const isValidDivision = Number.isInteger(monthlyValue * 100) / 100 === monthlyValue;

  if (!isValidDivision) {
    return {
      isValid: false,
      error: `O valor total (R$ ${totalValue}) não pode ser dividido igualmente entre ${months.length} meses`
    };
  }

  return {
    isValid: true,
    monthlyValue: monthlyValue,
    message: `Valor mensal: R$ ${monthlyValue.toFixed(2)}`
  };
}
