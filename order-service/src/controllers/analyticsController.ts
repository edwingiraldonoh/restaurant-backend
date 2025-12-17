import { Request, Response } from 'express';
import { Order, IOrder } from '../models/Order';

interface AnalyticsQuery {
  from: string;
  to: string;
  groupBy: 'day' | 'week' | 'month' | 'year';
  top?: number;
}

// Obtener analytics de órdenes
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, groupBy, top } = req.query as any;

    if (!from || !to || !groupBy) {
      res.status(400).json({
        success: false,
        message: 'Parámetros requeridos: from, to, groupBy',
      });
      return;
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // Incluir todo el día final

    // Obtener todas las órdenes en el rango de fechas
    const orders = await Order.find({
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).sort({ createdAt: 1 });

    if (orders.length === 0) {
      res.status(204).send();
      return;
    }

    // Calcular resumen
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: IOrder) => sum + (order.total || 0), 0);
    
    // Por ahora no calculamos avgPrepTime ya que no existe en el modelo
    const avgPrepTime = null;

    // Agrupar órdenes por período
    const groupedData = groupOrdersByPeriod(orders, groupBy);

    // Calcular productos más vendidos
    const productsSold = calculateProductsSold(orders);
    const topProducts = top ? productsSold.slice(0, parseInt(top as string)) : productsSold.slice(0, 10);

    res.status(200).json({
      success: true,
      range: {
        from: from,
        to: to,
        groupBy: groupBy,
      },
      summary: {
        totalOrders,
        totalRevenue,
        avgPrepTime,
      },
      series: groupedData,
      productsSold: productsSold,
      topNProducts: topProducts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener analíticas',
    });
  }
};

// Exportar analytics a CSV
export const exportAnalyticsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, groupBy, top, columns } = req.body;

    if (!from || !to || !groupBy) {
      res.status(400).json({
        success: false,
        message: 'Parámetros requeridos: from, to, groupBy',
      });
      return;
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).sort({ createdAt: 1 });

    // Generar CSV
    let csv = 'Date,Orders,Revenue,Avg Prep Time\n';

    const groupedData = groupOrdersByPeriod(orders, groupBy);
    
    groupedData.forEach((item: any) => {
      csv += `${item.period},${item.orders},${item.revenue},${item.avgPrepTime || 'N/A'}\n`;
    });

    // Agregar productos si se solicita
    if (!columns || columns.includes('products')) {
      csv += '\n\nTop Products\n';
      csv += 'Product,Quantity,Revenue\n';
      
      const productsSold = calculateProductsSold(orders);
      const topProducts = top ? productsSold.slice(0, parseInt(top)) : productsSold;
      
      topProducts.forEach((product: any) => {
        csv += `${product.name},${product.quantity},${product.revenue}\n`;
      });
    }

    const filename = `analytics-${from}-${to}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar analíticas',
    });
  }
};

// Función auxiliar para agrupar órdenes por período
function groupOrdersByPeriod(orders: any[], groupBy: string): any[] {
  const grouped: any = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    let period: string;

    switch (groupBy) {
      case 'day':
        period = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        const weekStart = getWeekStart(date);
        period = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        period = String(date.getFullYear());
        break;
      default:
        period = date.toISOString().split('T')[0];
    }

    if (!grouped[period]) {
      grouped[period] = {
        period,
        orders: 0,
        revenue: 0,
        prepTimes: [],
      };
    }

    grouped[period].orders += 1;
    grouped[period].revenue += order.total || 0;
    
    if (order.prepTime && typeof order.prepTime === 'number') {
      grouped[period].prepTimes.push(order.prepTime);
    }
  });

  // Convertir a array y calcular promedios
  return Object.values(grouped).map((item: any) => ({
    period: item.period,
    orders: item.orders,
    revenue: item.revenue,
    avgPrepTime: item.prepTimes.length > 0
      ? item.prepTimes.reduce((a: number, b: number) => a + b, 0) / item.prepTimes.length
      : null,
  }));
}

// Función auxiliar para obtener el inicio de la semana
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
  return new Date(d.setDate(diff));
}

// Función auxiliar para calcular productos vendidos
function calculateProductsSold(orders: any[]): any[] {
  const products: any = {};

  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const productName = item.name || item.productName || 'Unknown';
        const quantity = item.quantity || 1;
        const price = item.price || 0;

        if (!products[productName]) {
          products[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        products[productName].quantity += quantity;
        products[productName].revenue += price * quantity;
      });
    }
  });

  // Convertir a array y ordenar por cantidad
  return Object.values(products).sort((a: any, b: any) => b.quantity - a.quantity);
}
