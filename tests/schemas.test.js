import { describe, it, expect } from 'vitest';
import { validateValueDivision } from '../src/schemas/investment-goals.js';

describe('validateValueDivision', () => {
  describe('Divisões válidas', () => {
    it('deve aceitar divisão exata por 3 meses', () => {
      const result = validateValueDivision(3000, ['january', 'february', 'march']);
      
      expect(result.isValid).toBe(true);
      expect(result.monthlyValue).toBe(1000);
    });

    it('deve aceitar divisão exata por 1 mês', () => {
      const result = validateValueDivision(2500, ['december']);
      
      expect(result.isValid).toBe(true);
      expect(result.monthlyValue).toBe(2500);
    });

    it('deve aceitar divisão com 2 casas decimais', () => {
      const result = validateValueDivision(10.50, ['january', 'february', 'march']);
      
      expect(result.isValid).toBe(true);
      expect(result.monthlyValue).toBe(3.50);
    });

    it('deve aceitar divisão que resulta em centavos', () => {
      const result = validateValueDivision(15, ['january', 'february']);
      
      expect(result.isValid).toBe(true);
      expect(result.monthlyValue).toBe(7.50);
    });

    it('deve aceitar divisão por 12 meses', () => {
      const result = validateValueDivision(12000, [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ]);
      
      expect(result.isValid).toBe(true);
      expect(result.monthlyValue).toBe(1000);
    });
  });

  describe('Divisões inválidas', () => {
    it('deve rejeitar divisão com mais de 2 casas decimais', () => {
      const result = validateValueDivision(1000, ['january', 'february', 'march']);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não pode ser dividido igualmente');
    });

    it('deve rejeitar divisão que resulta em dízima', () => {
      const result = validateValueDivision(100, ['january', 'february', 'march']);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não pode ser dividido igualmente');
    });

    it('deve rejeitar valor null', () => {
      const result = validateValueDivision(null, ['january']);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor e meses são obrigatórios');
    });

    it('deve rejeitar meses null', () => {
      const result = validateValueDivision(1000, null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor e meses são obrigatórios');
    });

    it('deve rejeitar array de meses vazio', () => {
      const result = validateValueDivision(1000, []);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Valor e meses são obrigatórios');
    });
  });

  describe('Mensagem de retorno', () => {
    it('deve retornar mensagem com valor mensal formatado', () => {
      const result = validateValueDivision(6000, ['january', 'february']);
      
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Valor mensal: R$ 3000.00');
    });
  });
});

