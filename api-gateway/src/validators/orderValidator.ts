import { Request } from 'express';
import { Validators } from '../utils/validators';
import { CreateOrderRequest } from '../types';

/**
 * Validador para pedidos
 * Aplica Single Responsibility Principle
 */
export class OrderValidator {
  /**
   * Valida los datos para crear un nuevo pedido
   */
  static validateCreateOrder(req: Request): { valid: boolean; message?: string } {
    if (Validators.isEmpty(req.body)) {
      return { valid: false, message: 'El cuerpo de la petición está vacío' };
    }

    const { orderItems, customerName, customerEmail } = req.body as CreateOrderRequest;

    // Validar orderItems (items del pedido)
    const orderItemsValidation = Validators.validateArray(orderItems, 'orderItems', 1);
    if (!orderItemsValidation.valid) {
      return orderItemsValidation;
    }

    // Validar que cada item tenga los campos requeridos
    if (Array.isArray(orderItems)) {
      for (let i = 0; i < orderItems.length; i++) {
        const item = orderItems[i];
        if (!item.dishName || typeof item.dishName !== 'string') {
          return { valid: false, message: `orderItems[${i}].dishName es requerido y debe ser una cadena de texto` };
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return { valid: false, message: `orderItems[${i}].quantity es requerido y debe ser un número mayor a 0` };
        }
        if (!item.unitPrice || typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
          return { valid: false, message: `orderItems[${i}].unitPrice es requerido y debe ser un número mayor a 0` };
        }
      }
    }

    // Validar customerName
    const nameValidation = Validators.validateRequired(customerName, 'customerName');
    if (!nameValidation.valid) {
      return nameValidation;
    }

    // Validar customerEmail
    const emailValidation = Validators.validateEmail(customerEmail);
    if (!emailValidation.valid) {
      return emailValidation;
    }

    return { valid: true };
  }

  /**
   * Valida que el ID del pedido esté presente
   */
  static validateOrderId(req: Request): { valid: boolean; message?: string } {
    const { id } = req.params;
    if (Validators.isEmpty(id)) {
      return { valid: false, message: 'Se requiere el ID del pedido' };
    }
    return { valid: true };
  }
}

