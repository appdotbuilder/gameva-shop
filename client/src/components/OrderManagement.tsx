
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import type { Order, UpdateOrderStatusInput } from '../../../server/src/schema';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderWithDetails extends Order {
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getOrders.query();
      setOrders(result);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Stub data for demonstration
      setOrders([
        {
          id: 1,
          user_id: 1,
          status: 'pending',
          total_amount: 699.98,
          shipping_address_id: 1,
          created_at: new Date('2024-01-25'),
          updated_at: new Date('2024-01-25'),
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          items: [
            { id: 1, product_id: 1, product_name: 'Premium Wireless Headphones', quantity: 2, price: 299.99 },
            { id: 2, product_id: 2, product_name: 'Smart Fitness Watch', quantity: 1, price: 199.99 }
          ],
          shipping_address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip_code: '10001'
          }
        },
        {
          id: 2,
          user_id: 2,
          status: 'shipped',
          total_amount: 89.99,
          shipping_address_id: 2,
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-21'),
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          items: [
            { id: 3, product_id: 3, product_name: 'Portable Coffee Maker', quantity: 1, price: 89.99 }
          ],
          shipping_address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip_code: '90210'
          }
        },
        {
          id: 3,
          user_id: 3,
          status: 'delivered',
          total_amount: 39.99,
          shipping_address_id: 3,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-18'),
          customer_name: 'Bob Johnson',
          customer_email: 'bob@example.com',
          items: [
            { id: 4, product_id: 4, product_name: 'Wireless Mouse', quantity: 1, price: 39.99 }
          ],
          shipping_address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zip_code: '60601'
          }
        },
        {
          id: 4,
          user_id: 1,
          status: 'confirmed',
          total_amount: 129.99,
          shipping_address_id: 1,
          created_at: new Date('2024-01-22'),
          updated_at: new Date('2024-01-23'),
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          items: [
            { id: 5, product_id: 5, product_name: 'Stylish Backpack', quantity: 1, price: 79.99 },
            { id: 6, product_id: 6, product_name: 'LED Desk Lamp', quantity: 1, price: 49.99 }
          ],
          shipping_address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip_code: '10001'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const updateData: UpdateOrderStatusInput = {
        id: orderId,
        status: newStatus as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
      };
      
      await trpc.updateOrderStatus.mutate(updateData);
      
      setOrders((prev: OrderWithDetails[]) =>
        prev.map((order: OrderWithDetails) =>
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'], updated_at: new Date() }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

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

  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const filteredOrders = orders.filter((order: OrderWithDetails) => {
    return statusFilter === 'all' || order.status === statusFilter;
  });

  const getOrderStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const todayOrders = orders.filter(o => 
      o.created_at.toDateString() === new Date().toDateString()
    ).length;

    return { totalOrders, pendingOrders, totalRevenue, todayOrders };
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold text-purple-600">{stats.todayOrders}</p>
              </div>
              <div className="text-2xl">🆕</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                  <SelectItem value="shipped">🚚 Shipped</SelectItem>
                  <SelectItem value="delivered">📦 Delivered</SelectItem>
                  <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setStatusFilter('all')}>
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order: OrderWithDetails) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {order.customer_name} ({order.customer_email})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Placed on</p>
                        <p className="font-medium">{order.created_at.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-purple-600">${order.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="font-medium">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Select
                      value={order.status}
                      onValueChange={(value: string) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                        <SelectItem value="shipped">🚚 Shipped</SelectItem>
                        <SelectItem value="delivered">📦 Delivered</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                <p className="text-gray-600">
                  {statusFilter === 'all' 
                    ? 'No orders have been placed yet.'
                    : `No orders with status "${statusFilter}" found.`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">👤 Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📋 Order Information</h4>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Placed:</strong> {selectedOrder.created_at.toLocaleDateString()}</p>
                  <p><strong>Updated:</strong> {selectedOrder.updated_at.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">📦 Items Ordered</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-semibold mb-2">📍 Shipping Address</h4>
                  <div className="p-3 bg-gray-50 rounded">
                    <p>{selectedOrder.shipping_address.street}</p>
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
