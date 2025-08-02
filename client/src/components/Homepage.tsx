
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../../../server/src/schema';

interface HomepageProps {
  onViewProduct: (productId: number) => void;
}

export function Homepage({ onViewProduct }: HomepageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Since backend handlers are stubs, use demo data directly
      const demoProducts: Product[] = [
        {
          id: 1,
          name: "Premium Wireless Headphones",
          description: "High-quality sound with noise cancellation",
          price: 299.99,
          stock_quantity: 50,
          category_id: 1,
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: "Smart Fitness Watch",
          description: "Track your fitness goals with style",
          price: 199.99,
          stock_quantity: 30,
          category_id: 2,
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: "Portable Coffee Maker",
          description: "Perfect coffee anywhere you go",
          price: 89.99,
          stock_quantity: 25,
          category_id: 3,
          images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Simulate loading delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setFeaturedProducts(demoProducts);
    } catch (error) {
      console.error('Failed to load featured products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 md:p-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to ShopEase! 🎉
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Discover amazing products at unbeatable prices
        </p>
        <Button 
          size="lg" 
          variant="secondary"
          className="text-purple-600 hover:text-purple-700 px-8"
        >
          Shop Now 🛍️
        </Button>
      </div>

      {/* Featured Products */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ⭐ Featured Products
          </h2>
          <p className="text-gray-600">
            Hand-picked items just for you
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product: Product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                    ⭐ Featured
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button 
                      onClick={() => onViewProduct(product.id)}
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {product.stock_quantity > 0 ? (
                      <span className="text-green-600">✅ In Stock ({product.stock_quantity})</span>
                    ) : (
                      <span className="text-red-600">❌ Out of Stock</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Why Choose ShopEase? 🤔
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="font-semibold text-lg mb-2">Fast Shipping</h3>
            <p className="text-gray-600">Free delivery on orders over $50</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
            <p className="text-gray-600">Your data is safe with us</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold text-lg mb-2">Quality Products</h3>
            <p className="text-gray-600">Only the best for our customers</p>
          </div>
        </div>
      </section>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm text-center">
          🔔 This is a demo application. All product data is simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
