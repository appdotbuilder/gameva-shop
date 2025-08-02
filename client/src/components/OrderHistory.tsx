
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import type { Order } from '../../../server/src/schema';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
}

interface OrderWithDetails extends Order {
  items?: OrderItem[];
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

interface OrderHistoryProps {
  userId: number;
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getUserOrders.query({ userId });
      setOrders(result);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Stub data for demonstration
      setOrders([
        {
          id: 1,
          user_id: userId,
          status: 'delivered',
          total_amount: 699.98,
          shipping_address_id: 1,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-18'),
          items: [
            {
              id: 1,
              product_id: 1,
              quantity: 2,
              price: 299.99,
              product_name: "Premium Wireless Headphones",
              product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            },
            {
              id: 2,
              product_id: 2,
              quantity: 1,
              price: 199.99,
              product_name: "Smart Fitness Watch",
              product_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
            }
          ],
          shipping_address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip_code: "10001"
          }
        },
        {
          id: 2,
          user_id: userId,
          status: 'shipped',
          total_amount: 89.99,
          shipping_address_id: 1,
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-21'),
          items: [
            {
              id: 3,
              product_id: 3,
              quantity: 1,
              price: 89.99,
              product_name: "Portable Coffee Maker",
              product_image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"
            }
          ],
          shipping_address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip_code: "10001"
          }
        },
        {
          id: 3,
          user_id: userId,
          status: 'pending',
          total_amount: 39.99,
          shipping_address_id: 1,
          created_at: new Date('2024-01-25'),
          updated_at: new Date('2024-01-25'),
          items: [
            {
              id: 4,
              product_id: 4,
              quantity: 1,
              price: 39.99,
              product_name: "Wireless Mouse",
              product_image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"
            }
          ],
          shipping_address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip_code: "10001"
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">📋 Order History</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="p-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your order history here!
          </p>
          <Button size="lg">
            Start Shopping 🛍️
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📋 Order History</h1>
      
      <div className="space-y-4">
        {orders.map((order: OrderWithDetails) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Placed on {order.created_at.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                  {order.shipping_address && (
                    <span className="ml-2">
                      • Shipping to {order.shipping_address.city}, {order.shipping_address.state}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                </Button>
              </div>
              
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold">Items Ordered:</h4>
                    {order.items?.map((item: OrderItem) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Shipping Address:</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p>{order.shipping_address.street}</p>
                        <p>
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Order Timeline */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Order Status:</h4>
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Order placed:</span>
                        <span>{order.created_at.toLocaleDateString()}</span>
                      </div>
                      {order.updated_at.getTime() !== order.created_at.getTime() && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Last updated:</span>
                          <span>{order.updated_at.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
