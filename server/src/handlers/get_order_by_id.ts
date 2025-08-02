
import { db } from '../db';
import { ordersTable, orderItemsTable, productsTable, addressesTable } from '../db/schema';
import { type Order } from '../schema';
import { eq } from 'drizzle-orm';

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    // Query order with shipping address
    const orderResults = await db.select()
      .from(ordersTable)
      .innerJoin(addressesTable, eq(ordersTable.shipping_address_id, addressesTable.id))
      .where(eq(ordersTable.id, id))
      .execute();

    if (orderResults.length === 0) {
      return null;
    }

    const orderData = orderResults[0];

    // Convert numeric fields back to numbers
    const order: Order = {
      id: orderData.orders.id,
      user_id: orderData.orders.user_id,
      status: orderData.orders.status,
      total_amount: parseFloat(orderData.orders.total_amount),
      shipping_address_id: orderData.orders.shipping_address_id,
      created_at: orderData.orders.created_at,
      updated_at: orderData.orders.updated_at
    };

    return order;
  } catch (error) {
    console.error('Failed to get order by ID:', error);
    throw error;
  }
}
