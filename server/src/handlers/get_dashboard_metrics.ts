
import { db } from '../db';
import { usersTable, ordersTable, orderItemsTable, productsTable } from '../db/schema';
import { type DashboardMetrics } from '../schema';
import { eq, sum, count, gte, lt, sql } from 'drizzle-orm';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Get total sales (sum of all order amounts)
    const totalSalesResult = await db.select({
      total: sum(ordersTable.total_amount)
    })
    .from(ordersTable)
    .execute();

    const totalSales = totalSalesResult[0]?.total 
      ? parseFloat(totalSalesResult[0].total) 
      : 0;

    // Get total orders count
    const totalOrdersResult = await db.select({
      count: count()
    })
    .from(ordersTable)
    .execute();

    const totalOrders = totalOrdersResult[0]?.count || 0;

    // Get new orders today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newOrdersTodayResult = await db.select({
      count: count()
    })
    .from(ordersTable)
    .where(gte(ordersTable.created_at, today))
    .execute();

    const newOrdersToday = newOrdersTodayResult[0]?.count || 0;

    // Get total customers (users with role 'customer')
    const totalCustomersResult = await db.select({
      count: count()
    })
    .from(usersTable)
    .where(eq(usersTable.role, 'customer'))
    .execute();

    const totalCustomers = totalCustomersResult[0]?.count || 0;

    // Get low stock products (stock_quantity <= 10)
    const lowStockResult = await db.select({
      count: count()
    })
    .from(productsTable)
    .where(sql`${productsTable.stock_quantity} <= 10`)
    .execute();

    const lowStockProducts = lowStockResult[0]?.count || 0;

    // Get top selling products (by total quantity sold)
    const topSellingResult = await db.select({
      product_id: orderItemsTable.product_id,
      product_name: productsTable.name,
      total_sold: sum(orderItemsTable.quantity)
    })
    .from(orderItemsTable)
    .innerJoin(productsTable, eq(orderItemsTable.product_id, productsTable.id))
    .groupBy(orderItemsTable.product_id, productsTable.name)
    .orderBy(sql`${sum(orderItemsTable.quantity)} DESC`)
    .limit(5)
    .execute();

    const topSellingProducts = topSellingResult.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      total_sold: parseInt(item.total_sold || '0')
    }));

    return {
      total_sales: totalSales,
      total_orders: totalOrders,
      new_orders_today: newOrdersToday,
      total_customers: totalCustomers,
      low_stock_products: lowStockProducts,
      top_selling_products: topSellingProducts
    };
  } catch (error) {
    console.error('Dashboard metrics calculation failed:', error);
    throw error;
  }
}
