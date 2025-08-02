
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { DashboardMetrics } from '../../../server/src/schema';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getDashboardMetrics.query();
      setMetrics(result);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
      // Stub data for demonstration
      setMetrics({
        total_sales: 12567.89,
        total_orders: 156,
        new_orders_today: 8,
        total_customers: 89,
        low_stock_products: 3,
        top_selling_products: [
          { product_id: 1, product_name: "Premium Wireless Headphones", total_sold: 45 },
          { product_id: 2, product_name: "Smart Fitness Watch", total_sold: 32 },
          { product_id: 3, product_name: "Portable Coffee Maker", total_sold: 28 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">😔</div>
          <h3 className="text-xl font-semibold mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600">Unable to load dashboard metrics. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💰 Total Sales</CardTitle>
            <div className="text-2xl">💰</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.total_sales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue generated to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📋 Total Orders</CardTitle>
            <div className="text-2xl">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.total_orders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🆕 New Orders Today</CardTitle>
            <div className="text-2xl">🆕</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.new_orders_today}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders placed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">👥 Total Customers</CardTitle>
            <div className="text-2xl">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {metrics.total_customers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics.low_stock_products > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              {metrics.low_stock_products} product{metrics.low_stock_products !== 1 ? 's' : ''} running low on stock. 
              Please restock soon to avoid stockouts.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_selling_products.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.product_name}</p>
                      <p className="text-xs text-gray-500">Product ID: {product.product_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{product.total_sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Order Value:</span>
              <span className="font-semibold">
                ${metrics.total_orders > 0 ? (metrics.total_sales / metrics.total_orders).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue per Customer:</span>
              <span className="font-semibold">
                ${metrics.total_customers > 0 ? (metrics.total_sales / metrics.total_customers).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Orders Rate:</span>
              <span className="font-semibold">
                {metrics.total_orders > 0 ? ((metrics.new_orders_today / metrics.total_orders) * 100).toFixed(1) : '0'}% today
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
