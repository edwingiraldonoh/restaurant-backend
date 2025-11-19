import { Validators } from '../utils/validators';

describe('Validators', () => {
  describe('isEmail', () => {
    it('debería validar emails correctos', () => {
      expect(Validators.isEmail('test@example.com')).toBe(true);
      expect(Validators.isEmail('user.name@example.co.uk')).toBe(true);
      expect(Validators.isEmail('user+tag@example.com')).toBe(true);
    });

    it('debería rechazar emails incorrectos', () => {
      expect(Validators.isEmail('invalid-email')).toBe(false);
      expect(Validators.isEmail('@example.com')).toBe(false);
      expect(Validators.isEmail('user@')).toBe(false);
      expect(Validators.isEmail('user@.com')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('debería detectar valores vacíos', () => {
      expect(Validators.isEmpty(null)).toBe(true);
      expect(Validators.isEmpty(undefined)).toBe(true);
      expect(Validators.isEmpty('')).toBe(true);
      expect(Validators.isEmpty('   ')).toBe(true);
      expect(Validators.isEmpty([])).toBe(true);
      expect(Validators.isEmpty({})).toBe(true);
    });

    it('debería detectar valores no vacíos', () => {
      expect(Validators.isEmpty('text')).toBe(false);
      expect(Validators.isEmpty(['item'])).toBe(false);
      expect(Validators.isEmpty({ key: 'value' })).toBe(false);
      expect(Validators.isEmpty(0)).toBe(false);
      expect(Validators.isEmpty(false)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('debería validar emails correctos', () => {
      const result = Validators.validateEmail('test@example.com');
      expect(result.valid).toBe(true);
    });

    it('debería rechazar emails vacíos', () => {
      const result = Validators.validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('requerido');
    });

    it('debería rechazar emails con formato inválido', () => {
      const result = Validators.validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('formato');
    });
  });

  describe('validateRequired', () => {
    it('debería validar valores presentes', () => {
      const result = Validators.validateRequired('value', 'fieldName');
      expect(result.valid).toBe(true);
    });

    it('debería rechazar valores vacíos', () => {
      const result = Validators.validateRequired('', 'fieldName');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('fieldName');
    });
  });

  describe('validateArray', () => {
    it('debería validar arrays con elementos suficientes', () => {
      const result = Validators.validateArray([1, 2, 3], 'fieldName', 1);
      expect(result.valid).toBe(true);
    });

    it('debería rechazar valores que no son arrays', () => {
      const result = Validators.validateArray('not-array', 'fieldName');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('array');
    });

    it('debería rechazar arrays con menos elementos que el mínimo', () => {
      const result = Validators.validateArray([], 'fieldName', 1);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('al menos');
    });
  });
});

